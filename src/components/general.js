/* Copyright (C) 2019  oscons (github.com/oscons). All rights reserved.
 * Licensed under the GNU General Public License, Version 2.0.
 * See LICENSE file for more information */

import {ud, undefault, expand_args, freeze_values, mix_values, get_time, get_bpm} from "./util";

const _functions = {};

_functions.set = {doc: ``
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

_functions.use = {fun: (args) => {
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

_functions.get = {fun: (args) => {
    const {n: name} = expand_args({n: "val"}, args);

    return (input, gen_args, run_args) => {
        const [nv] = freeze_values([name], run_args, gen_args);

        const ret = gen_args.values[nv];
        
        gen_args.current_value = ret;

        return ret;
    };
}};

_functions.used = {fun: () => ((_, gen_args) => gen_args.current_value)};

_functions.noop = {fun: () => ((input) => input)};

export const functions = {
    __category: "general"
    , __doc: {
        title: "General functions"
        , description: ``
    }
    , ..._functions
};

