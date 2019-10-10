/* Copyright (C) 2019  oscons (github.com/oscons). All rights reserved.
 * Licensed under the GNU General Public License, Version 2.0.
 * See LICENSE file for more information */

import {ud, expand_args, freeze_values, undefault, get_time} from "./util";

const make_functions = ({logger = console.log}) => {
    const _functions = {};

    _functions.set =
        {doc: {
            title: "Set a value"
            , command: [
                'set(v, t)', 'set({v, t})'
            ]
            , params: {
                v: `The value to set. This can either be a scalar value or a
    function that returns a scalar value.`
            }
            , return: "The set value"
            , description: `Set the `
            , see_also: ['use', 'time']
            , examples: [
                'Shape(L.set(5))'
                , 'Shape(L.set(({time}) => time % 5))'
                , 'Shape(L.set(({time}) => time + 5).)'
            ]
        }
        , fun: (args) => {
            let avalue = 0;
            let tgt_value = ud;
            
            if (typeof args !== 'undefined') {
                if (Array.isArray(args)) {
                    if (args.length > 0) {
                        const [first_arg, second_arg] = args;
                        if (typeof first_arg === 'object') {
                            if (Array.isArray(first_arg)) {
                                avalue = 0;
                            } else if ('v' in first_arg) {
                                avalue = first_arg.v;
                            } else {
                                avalue = 0;
                            }
                        } else {
                            avalue = first_arg;
                        }
                        if (typeof second_arg === 'string') {
                            tgt_value = second_arg;
                        }
                    }
                } else if (typeof args !== 'object') {
                    avalue = args;
                }
            }

            if (typeof args !== 'undefined' && args.length > 0
                && (typeof args[0] !== 'object'
                    || Array.isArray(args[0])
                    || 'v' in Object.keys(args[0])
                )) {
                const {v} = expand_args({v: ud}, args);
                avalue = v;
            }
            const value = avalue;

            return (input, gen_args, run_args) => {
                const vv = freeze_values(value, run_args, gen_args);
                
                if (typeof tgt_value !== 'undefined') {
                    gen_args.values[tgt_value] = vv;

                    if (tgt_value !== gen_args.current_value) {
                        return input;
                    }
                }

                return vv;
            };
        }};

    _functions.use =
        {doc: {
            title: "Set the currently modified value."
            , command: [
                "use(n, c)", "use({n, c})"
            ]
            , params: {
                n: `The name of the value. The default value is \`val\`. You can
    manipulate \`time\` or \`bpm\` or any other string value as well.`
                , c: `Should the currently in use value be copied over to the new on
    one. Either \`true\` to copy or \`false\` to keep the value untouched. Defaul
    is \`false\``
            }
            , return: "The currently in use value."
            , description: `You can manipulate a custom list of values which
    you can refer to by name. The \`val\` value is the default used initially.
    The last value that's in \`use\` will be what the LFO function finally returns.

    Though \`fast\` and
    the likes are the preferred way to manipulate time you can also use
    \`use('time')\` to manipulate time directly or return its value from the LFO 
    function.`
            , examples: [
                "shape(L.set(10).use('time').mul(2).use('val')).out(o0)"
                , "shape(10, L.use('time').add(1).use('val').sin().add(1)).out(o0)"
            ]
        }
        , fun: (args) => {
            const {n: name, c: copy} = expand_args({n: "val", c: false}, args);

            return (input, gen_args, run_args) => {
                const [nv, cv] = freeze_values([name, copy], run_args, gen_args);

                let ret = gen_args.values[nv];
                
                if (cv) {
                    ret = input;
                }
                gen_args.current_value = nv;

                return ret;
            };
        }};

    _functions.get =
        {doc: {
            title: "Set the current value to a named one."
            , command: [
                "get(n)", "get({n})"
            ]
            , params: {
                n: "The name of the value to get, e.g. `time` to get the current time. Default value is `val`"
            }
            , return: "The value saved unter the name specified by `n`. Can be undefined."
            , description: `Fetches the value stored with the name \`n\` and sets it as the current value.`
            , examples: [
                "shape(3, L.get('time').mul(2).use('time', true).sin(1, 0.5, 0.5)).out(o0)"
            ]
        }
        , fun: (args) => {
            const {n: name} = expand_args({n: "val"}, args);

            return (input, gen_args, run_args) => {
                const [nv] = freeze_values([name], run_args, gen_args);

                const ret = gen_args.values[nv];
                
                gen_args.current_value = ret;

                return ret;
            };
        }};

    _functions.used =
        {doc: {
            title: "Return the name of the currently in `use` value"
            , command: [
                "used()"
            ]
            , params: {
            }
            , return: "The name set by the last `use` command or `val` if not set at all."
            , description: `This function allows you to retrieve the name of the
    current default parameter that is modufied by functions like \`mul\` or \`set\`.

    This is usually most helpful for debugging purposes, though you could use it in
    \`map\` too.`
            , examples: [
                "console.log(L.used()) // == 'val'"
                , "console.log(L.use('time').used()) == 'time'"
                , `
    shape(3)
        .rotate(
            L.use(() => (time % 2 < 1 ? "cos" : "sin"))
                .used()
                .map((x, _, {time}) => eval(\`Math.$\{x}(time)\`))
                .mul(2)
        ).out(o0)

    `
            ]
        }
        , fun: () => ((_, gen_args) => gen_args.current_value)};

    _functions.noop =
        {doc: {
            title: "Do nothing"
            , command: ["noop()"]
            , params: {
            }
            , return: "The unmodified input value."
            , description: `This function performs no operation. It's mostly used
    for debugging and testing purposes`
            , examples: [
                "L.noop().gen()({val: 2}) // == 2"
                , "L.time().noop().run({time: 2}) // == 2"
            ]
        }
        , fun: () => ((input) => input)};

    _functions.stop = {fun: (args) => {
        const {v: value} = expand_args({v: ud}, args);

        const fi = function (input, gen_args, run_args) {
            const vv = freeze_values(value, run_args, gen_args);

            return undefault(vv, undefault(input, get_time(gen_args, run_args)));
        };
        fi.stop = true;
        return fi;
    }};
    
    return _functions;
};

export const functions = ({logger = console.log}) => ({
    __category: "general"
    , __doc: {
        title: "General Hydra LFO utility functions"
        , description: `Functions that perform various tasks on Hydra LFO
values or its processing chain.`
    }
    , ...(make_functions({logger}))
});
