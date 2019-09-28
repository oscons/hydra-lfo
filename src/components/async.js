/* Copyright (C) 2019  oscons (github.com/oscons). All rights reserved.
 * Licensed under the GNU General Public License, Version 2.0.
 * See LICENSE file for more information */

import {ud, expand_args, get_bpm, get_global_env, uuid} from "./util";

const _functions = {};

_functions.async = {
    doc: {
        title: "Asynchronously execute a function"
        , command: [
            'async(f, r, d)'
            , 'async({f, r, d})'
        ]
        , params: {
            f: "Function to execute. Default is `() => {}`"
            , r: `Run frequency of the function. A value of \`0\` or less will
result in the function being called only once. Default is \`1\``
            , d: "Delay before first run. Default is `0`"
        }
        , return: "The unaltered input value."
        , description: `The provided function is run with a frequency of \`r\`
per time unit. All parameters are based on the current \`time\` and \`bpm\`,
assuming \`time\` is in beats. Timing is not guaranteed, so \`f\` might drift
over time.

Internally async is implemented using setTimeout with all implications regarding
execution context.`
        , examples: [`const x = {v: 3};
shape(
    L.async(() => x.v = ((x.v + 1 ) % 5) + 3)
        .set(() => x.v)
).out(o0);`
        ]
    }
    , fun: (args) => {
        const {f: fn, r: run_freq, d: delay} = expand_args({f: ud, r: 1, d: 0}, args);

        const thread_state = {
            id: uuid()
            , do_stop: false
            , running: false
            , last_args: [ud, ud, ud]
        };

        return (input, gen_args, run_args) => {
            thread_state.last_args = [input, gen_args, run_args];

            if (typeof fn === 'undefined') {
                return input;
            }

            // luckyily javascript is single threaded...
            let asyncs = gen_args.global_state.async;
            if (typeof asyncs !== 'undefined') {
                return input;
            }

            gen_args.global_state.async = {};
            asyncs = gen_args.global_state.async;

            if (typeof asyncs[thread_state.id] !== 'undefined') {
                return input;
            }

            gen_args.global_state.cleanup.push(() => {
                thread_state.do_stop = true;
                thread_state.last_args = [ud, ud, ud];
            });

            asyncs[thread_state.id] = {
                init: gen_args.values.time
                , state: thread_state
            };

            const bpm = get_bpm(gen_args, run_args, false);
            const beats_to_millis = (n) => Math.max((60 / bpm) / n * 1000, 100);
            const timeout = run_freq <= 0 ? -1 : beats_to_millis(run_freq);
            const delayt = beats_to_millis(delay);
            const env = get_global_env();
            const tfunc = () => {
                if (thread_state.do_stop) {
                    return;
                }
                const ret = fn(...thread_state.last_args);
                if (!ret) {
                    return;
                }
                if (timeout > 0) {
                    env.setTimeout(tfunc, timeout);
                }
            };

            console.log(`startring thread ${thread_state.id}, delayt=${delayt} timeout=${timeout}`);
            if (typeof env !== 'undefined') {
                if (delay <= 0) {
                    thread_state.running = true;
                    tfunc();
                } else {
                    env.setTimeout(() => {
                        thread_state.running = true;
                        tfunc();
                    }, delayt);
                }
            }
            
            return input;
        };
    }
};

export const functions = {
    __category: "async"
    , __doc: {
        title: "Asynchronous functions"
        , description: `Functions allowing you to perform actions asynchronously
to the main processing done in Hydra.`
    }
    , ..._functions
};

