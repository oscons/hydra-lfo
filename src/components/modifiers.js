/* Copyright (C) 2019  oscons (github.com/oscons). All rights reserved.
 * Licensed under the GNU General Public License, Version 2.0.
 * See LICENSE file for more information */

import {ud, undefault, expand_args, freeze_values, get_time} from "./util";

const make_functions = ({logger = console.log}) => {
    const _functions = {};

    // TODO: this should be locked to time/BPM boundaries
    _functions.sah = {fun: (args) => {
        const {h: hold_time} = expand_args({h: 1}, args);

        return (input, gen_args, run_args) => {
            const hv = freeze_values(hold_time, run_args, gen_args);

            let prev_time = Number.MIN_SAFE_INTEGER;
            if (typeof gen_args.private_state.time !== 'undefined') {
                prev_time = gen_args.private_state.time;
            }
            if (typeof gen_args.private_state.value === 'undefined') {
                gen_args.private_state.value = input;
            }

            if ((gen_args.values.time - prev_time) >= Math.abs(hv)) {
                gen_args.private_state.value = input;
                gen_args.private_state.time = gen_args.values.time;
            }
            
            return gen_args.private_state.value;
        };
    }};

    const DEFAULT_SLEW_TYPE = 'h';
    const SLEW_TYPES = {
        // hard limit slew
        h: (curr, tgt, tdiff, max_rate) => {
            const curr_rate = (tgt - curr) / tdiff;
            if (Math.abs(curr_rate) <= max_rate) {
                return tgt;
            }
            return curr + (max_rate * tdiff * Math.sign(curr_rate));
        }
    };

    _functions.slew = {fun: (args) => {
        const {r: rate, t: type, i: ival} = expand_args({r: 0.5, t: DEFAULT_SLEW_TYPE, i: 1}, args);

        return (input, gen_args, run_args) => {
            const [rv, iv, tv] = freeze_values([rate, ival, type], run_args, gen_args);

            if (typeof gen_args.private_state.time === 'undefined') {
                gen_args.private_state.time = get_time(gen_args, run_args);
                gen_args.private_state.prev = input;
                gen_args.private_state.tgt = input;
                return input;
            }

            const tgt = undefault(input, gen_args.private_state.tgt);
            if (typeof tgt === 'undefined') {
                return ud;
            }

            if (typeof gen_args.private_state.prev === 'undefined') {
                gen_args.private_state.prev = tgt;
            }

            const time = get_time(gen_args, run_args);
            const tdiff = time - gen_args.private_state.time;
            const max_rate = rv / iv;
            
            gen_args.private_state.time = time;
            gen_args.private_state.tgt = tgt;

            gen_args.private_state.prev = SLEW_TYPES[tv](gen_args.private_state.prev, tgt, tdiff, max_rate);

            return gen_args.private_state.prev;
        };
    }};

    _functions.map = {fun: (args) => {
        const {f: func} = expand_args({f: (x) => x}, args);

        return (value, gen_args, run_args) => func(value, gen_args, ...run_args);
    }};

    _functions.clip = {doc: {
        title: "Clip a value between two thresholds"
        , command: [
            "clip(u, l, s)", "clip({u, l, s})"
        ]
        , params: {
            u: "Upper bound. Default is 1"
            , l: "Lower bound. Default is 0"
            , s: "Scale to apply to inpcoming value *before* clipping. Default is 1"
            , o: "Offset to add *after* clipping. Default is 0"
        }
        , return: "A value in the range of `[l, u] + o`."
        , description: `Allows you to ensure the values are within an aceptable
    range for the following operations.`
        , examples: [`shape(3).rotate(
        L.set(L.time(), 'init')
            .use('init')
            .map((x, {time}) => time - x)
            .clip(10)
            .map((x) => (10 - x)/10)
            .rad()
    ).out(o0);`
        ]
    }
    , fun: (args) => {
        const {u: upper, l: lower, s: scale, o: offset} = expand_args({u: 1, l: 0, s: 1, o: 0}, args);

        return (input, gen_args, run_args) => {
            const [uv, lv, sv, ov] = freeze_values([upper, lower, scale, offset], run_args, gen_args);

            const v = undefault(input, 0) * sv;
            
            return (v > uv ? uv : (v < lv ? lv : v)) + ov;
        };
    }};
    return _functions;
};

export const functions = ({logger = console.log}) => ({
    __category: "modifiers"
    , __doc: {
        title: "Modifier functions"
        , description: `Functions that modify Hydra LFO values in some way or
another.`
    }
    , ...(make_functions({logger}))
});
