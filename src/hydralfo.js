/* Copyright (C) 2019  oscons (github.com/oscons). All rights reserved.
 * Licensed under the GNU General Public License, Version 2.0.
 * See LICENSE file for more information */

import {
    ud, CANARY, get_time, get_bpm, undefault, get_global_env
    , beats_to_time, time_to_beats
} from "./components/util";

import {functions as maths_functions} from './components/maths';
import {functions as generator_functions} from './components/generators';
import {functions as time_functions} from './components/time';
import {functions as general_functions} from './components/general';
import {functions as modifier_functions} from './components/modifiers';
import {functions as async_functions} from './components/async';

const builtin_functions = (options) => [
    maths_functions
    , generator_functions
    , time_functions
    , general_functions
    , modifier_functions
    , async_functions
].reduce((prev, ob) => {
    const obi = ob(options);
    let category_name = "other";
    if ('__category' in obi) {
        category_name = ob.__category;
    }
    const category = prev.doc[category_name] ? prev.doc[category_name] : {};

    if ('__doc' in ob) {
        category.__doc = ob.__doc;
    }

    Object.entries(obi)
        .filter(([name]) => name.indexOf("__") !== 0)
        .forEach(([name, value]) => {
            const {fun, doc} = value;
            category[name] = doc;
            prev.fn[name] = fun;
        });
    return prev;
}, {doc: {}, fn: {}});

const DOCUMENTATION = builtin_functions({logger: () => ud}).doc;

export const get_doc = () => DOCUMENTATION;

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
        , time_unit: 'b'
        , global_state
        , instance_state
        , private_state: {}
    };

    gen_args.set_time = (t) => {
        if (gen_args.time_unit === 'b') {
            gen_args.values.beats = t;
            gen_args.values.time = gen_args.values.beats;
            gen_args.values.clock_time = beats_to_time(t, gen_args.values.bpm);
        } else {
            gen_args.values.clock_time = t;
            gen_args.values.time = gen_args.values.clock_time;
            gen_args.values.beats = time_to_beats(t, gen_args.values.bpm);
        }
    };

    gen_args.scale_time = (s, fn) => {
        let fnx = fn;
        if (typeof fnx !== 'function') {
            fnx = (x) => x * s;
        }
        // logger({fn, tfnx: (typeof fnx), fnx});

        gen_args.set_time(fnx(gen_args.values.time));
    };

    gen_args.values.initial_time = get_time(gen_args.values, run_args);
    gen_args.values.clock_time = gen_args.values.initial_time;
    gen_args.values.bpm = get_bpm(gen_args.values, gen_args.values);

    if (gen_args.time_unit === 'b') {
        gen_args.values.time = time_to_beats(gen_args.values.clock_time, gen_args.values.bpm);
    } else {
        gen_args.values.time = gen_args.values.clock_time;
    }

    run_args[0] = gen_args.values;

    let stop_it = false;
    calls.forEach(([fncall, private_state]) => {
        if (stop_it) {
            return;
        }
        gen_args.private_state = private_state;
        gen_args.input = gen_args.values[gen_args.current_value];

        const res = fncall(gen_args.input, gen_args, run_args);
        gen_args.values[gen_args.current_value] = res;

        if (fncall.stop) {
            stop_it = true;
        }
    });
    
    const rval = gen_args.values[gen_args.current_value];
    if (typeof rval === 'undefined' && !run_options.return_undef) {
        return undefault(gen_args.values.time, 0);
    }

    return rval;
};

const sub_call = (call_options, global_state, prev_calls, fun) => {
    const {functions} = call_options;
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

    Object.entries(functions).forEach(([name, gen]) => {
        if (name in run_function && !(name in Object.getOwnPropertyNames())) {
            throw new Error(`${name} already exists on parents of run_function`);
        }
        if (typeof gen === 'undefined') {
            throw new Error(`undefined generator ${name}`);
        }
        run_function[name] = (...args) => sub_call(
            call_options
            , global_state
            , calls.map(([call]) => call)
            , gen(args)
        );
    });

    return run_function;
};

const make_new_lfo = ({state, logger}) => {
    const fdef = {};
    const global_state = undefault(state, {});
    
    global_state.cleanup = [];

    const functions = builtin_functions({logger}).fn;

    Object.keys(functions).forEach((name) => {
        fdef[name] = (...args) => sub_call({functions}, global_state, [])[name](...args);
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
    const {state = ud
        , init_global = true
        , force = false
        , logger = console.log} = undefault(args, {});
    const new_lfo = make_new_lfo({state, logger});

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

export default {
    init
    , get_doc
};
