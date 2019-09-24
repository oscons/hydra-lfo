
import {ud, CANARY, get_time, get_bpm} from "./components/util";

import {functions as maths_functions} from './components/maths';
import {functions as generator_functions} from './components/generators';
import {functions as time_functions} from './components/time';
import {functions as general_functions} from './components/general';
import {functions as modifier_functions} from './components/modifiers';

const BUILTIN_FUNCTIONS = [
    maths_functions
    , generator_functions
    , time_functions
    , general_functions
    , modifier_functions
];

const run_calls = (global_state, instance_state, calls, args) => {
    let run_args = args;
    if (typeof run_args === 'undefined' || run_args.length === 0) {
        run_args = [{}];
    }
    if (typeof run_args[0] === 'undefined') {
        run_args[0] = {};
    }

    const gen_args = {
        input: ud
        , current_value: "val"
        , values: {
            val: ud
            , initial_args: args
            , ...run_args[0]
        }
        , global_state
        , instance_state
        , private_state: {}
    };

    gen_args.values.initial_time = get_time(gen_args.values, gen_args.values);
    gen_args.values.time = gen_args.values.initial_time;
    gen_args.values.val = gen_args.values.time;
    gen_args.values.get_bpm = get_bpm(gen_args.values, gen_args.values);

    run_args[0] = gen_args.values;

    calls.forEach(([fncall, private_state]) => {
        gen_args.private_state = private_state;
        gen_args.input = gen_args.values[gen_args.current_value];

        const res = fncall(gen_args.input, gen_args, run_args);

        gen_args.values[gen_args.current_value] = res;
    });
    
    const rval = gen_args.values[gen_args.current_value];
    if (typeof rval === 'undefined') {
        return 0;
    }

    return rval;
};

const sub_call = (global_state, prev_calls, fun) => {
    const calls = prev_calls.map((x) => [x, {}]);
    const instance_state = {};

    if (typeof fun !== 'undefined') {
        calls.push([fun, {}]);
    }

    const rfun = (...args) => run_calls(global_state, instance_state, calls, args);
    rfun.run = rfun;
    rfun.gen = () => rfun;
    rfun[CANARY] = true;

    BUILTIN_FUNCTIONS.forEach((functions) => {
        Object.entries(functions).forEach(([name, gen]) => {
            if (name in rfun && !(name in Object.getOwnPropertyNames())) {
                throw new Error(`${name} already exists on parents of rfun`);
            }

            rfun[name] = (...args) => sub_call(
                global_state
                , calls.map(([call]) => call)
                , gen(args)
            );
        });
    });

    return rfun;
};

const get_global_env = () => {
    if (typeof window !== 'undefined') {
        return window;
    }
    return global;
};

const make_new_lfo = (state) => {
    const fdef = {};
    const global_state = typeof state === 'undefined' ? {} : state;
    
    BUILTIN_FUNCTIONS.forEach((functions) => {
        Object.keys(functions).forEach((name) => {
            fdef[name] = (...args) => sub_call(global_state, [])[name](...args);
        });
    });

    fdef.__release = (new_lfo) => {
        // for future use, e.g. to stop timeouts etc
    };

    return fdef;
};

const GLOBAL_INIT_ID = "__hydralfo_global";

export const init = (state = ud, init_global = true, force = false) => {
    const new_lfo = make_new_lfo(state);

    if (!init_global) {
        return new_lfo;
    }

    const env = get_global_env();

    if (typeof env !== 'undefined') {
        if (GLOBAL_INIT_ID in env) {
            const old_lfo = env[GLOBAL_INIT_ID];
            if (typeof old_lfo === 'object') {
                if (!force) {
                    return env[GLOBAL_INIT_ID];
                }
                if ('__release' in old_lfo) {
                    old_lfo.__release(new_lfo);
                }
            }
        }
        env[GLOBAL_INIT_ID] = new_lfo;
    }

    return new_lfo;
};
