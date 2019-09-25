/* Copyright (C) 2019  oscons (github.com/oscons). All rights reserved.
 * Licensed under the GNU General Public License, Version 2.0.
 * See LICENSE file for more information */

import {ud, CANARY, get_time, get_bpm, undefault, get_global_env} from "./components/util";

import {functions as maths_functions} from './components/maths';
import {functions as generator_functions} from './components/generators';
import {functions as time_functions} from './components/time';
import {functions as general_functions} from './components/general';
import {functions as modifier_functions} from './components/modifiers';
import {functions as async_functions} from './components/async';

const BUILTIN_FUNCTIONS = [
    maths_functions
    , generator_functions
    , time_functions
    , general_functions
    , modifier_functions
    , async_functions
].reduce((prev, ob) => {
    Object.entries(ob).forEach(([name, value]) => {
        prev[name] = value;
    });
    return prev;
}, {});

const extract_property = (arr, prop) => Object.entries(arr)
    .map(([name, value]) => [name, value[prop]])
    .reduce((prev, [name, value]) => {
        prev[name] = value;
        return prev;
    }, {});

export const get_doc = () => Object.entries(extract_property(BUILTIN_FUNCTIONS, "doc"))
    .filter(([, doc]) => typeof doc !== 'undefined')
    .reduce((prev, [name, doc]) => {
        [prev[name]] = doc;
        return prev;
    }, {});

const run_calls = (options, global_state, instance_state, calls, args) => {

    const run_options = {...{return_undef: false}, ...options};

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

    gen_args.values.initial_time = get_time(gen_args.values, run_args);
    gen_args.values.time = gen_args.values.initial_time;

    gen_args.values.get_bpm = get_bpm(gen_args.values, gen_args.values);

    run_args[0] = gen_args.values;

    calls.forEach(([fncall, private_state]) => {
        gen_args.private_state = private_state;
        gen_args.input = gen_args.values[gen_args.current_value];

        const res = fncall(gen_args.input, gen_args, run_args);

        gen_args.values[gen_args.current_value] = res;
    });
    
    const rval = gen_args.values[gen_args.current_value];
    if (typeof rval === 'undefined' && !run_options.return_undef) {
        return undefault(gen_args.values.time, 0);
    }

    return rval;
};

const sub_call = (global_state, prev_calls, fun) => {
    const calls = prev_calls.map((x) => [x, {}]);
    const instance_state = {};

    if (typeof fun !== 'undefined') {
        calls.push([fun, {}]);
    }

    const option_call = (options, args) => run_calls(options, global_state, instance_state, calls, args);

    const run_function = (...args) => option_call({}, args);
    run_function.run = run_function;
    run_function.gen = (options) => (...args) => option_call(options, args);
    run_function[CANARY] = true;

    Object.entries(extract_property(BUILTIN_FUNCTIONS, "fun"))
        .forEach(([name, gen]) => {
            if (name in run_function && !(name in Object.getOwnPropertyNames())) {
                throw new Error(`${name} already exists on parents of run_function`);
            }

            run_function[name] = (...args) => sub_call(
                global_state
                , calls.map(([call]) => call)
                , gen(args)
            );
        });

    return run_function;
};

const make_new_lfo = (state) => {
    const fdef = {};
    const global_state = undefault(state, {});
    
    global_state.cleanup = [];

    const functions = extract_property(BUILTIN_FUNCTIONS, "fun");

    Object.keys(functions).forEach((name) => {
        fdef[name] = (...args) => sub_call(global_state, [])[name](...args);
    });

    fdef.__release = (new_lfo) => {
        global_state.cleanup.forEach((cfn) => {
            cfn(global_state, new_lfo);
        });
    };

    return fdef;
};

const GLOBAL_INIT_ID = "__hydralfo_global";

export const init = (args) => {
    const {state = ud, init_global = true, force = false} = undefault(args, {});
    const new_lfo = make_new_lfo(state);

    if (!init_global) {
        return new_lfo;
    }

    const env = get_global_env();

    if (typeof env !== 'undefined') {
        if (GLOBAL_INIT_ID in env) {
            const old_lfo = env[GLOBAL_INIT_ID];
            if (typeof old_lfo === 'object') {
                if ('__release' in old_lfo) {
                    old_lfo.__release(new_lfo);
                }
                if (!force) {
                    return old_lfo;
                }
            }
        }
        env[GLOBAL_INIT_ID] = new_lfo;
    }

    return new_lfo;
};
