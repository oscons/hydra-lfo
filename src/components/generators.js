/* Copyright (C) 2019  oscons (github.com/oscons). All rights reserved.
 * Licensed under the GNU General Public License, Version 2.0.
 * See LICENSE file for more information */

import {ud, undefault, expand_args, freeze_values, mix_values, get_time, get_bpm} from "./util";

const TAU = 2 * Math.PI;

const make_functions = ({logger = console.log}) => {
    const _functions = {};

    // TODO: use LUTs
    _functions.sin = {fun: (args) => {
        const {f: frequency, s: scale, o: offset} = expand_args({f: 1, s: 1, o: 0}, args);

        return (input, gen_args, run_args) => {
            const [fv, sv, ov] = freeze_values([frequency, scale, offset], run_args, gen_args);
            let time = 0;

            time = undefault(input, get_time(gen_args, run_args, true));
            time = undefault(time, 0.25);

            return (((Math.sin(time * TAU * fv) / 2) + 0.5) * sv) + ov;
        };
    }};

    _functions.rnd = {fun: (args) => {
        const {s: scale, o: offset, m: mix} = expand_args({s: ud, o: 0, m: 0}, args);

        return (input, gen_args, run_args) => {
            const [sv, ov, mv] = freeze_values([scale, offset, mix], run_args, gen_args);

            let svx = 1;
            if (typeof input === 'undefined') {
                if (typeof sv === 'undefined') {
                    svx = 1;
                } else {
                    svx = sv;
                }
            } else if (typeof sv === 'undefined') {
                svx = input;
            } else {
                svx = mix_values(sv, input, mv);
            }

            return (Math.random() * svx) + ov;
        };
    }};

    _functions.rand = _functions.rnd;

    _functions.range = {fun: (args) => {
        const {u: upper, l: lower, s: step} = expand_args({u: 1, l: 0, s: 0.1}, args);

        return (input, gen_args, run_args) => {
            const [uv, lv, sv] = freeze_values([upper, lower, step], run_args, gen_args);
            
            let idx = undefault(input, get_time(gen_args, run_args, true));
            
            idx = undefault(idx, 0);

            let ub = uv;
            let lb = lv;

            // logger({t: run_args[0].time, input, idx, ub, lb, sv});
            if (ub < lb) {
                const tmp = lb;
                lb = ub;
                ub = tmp;
            } else if (ub === lb) {
                return ub;
            } else if (sv === 0 || idx === 0) {
                return lb;
            }

            const range = ub - lb;
            let v = (sv * idx) + lb;
            // logger({v, sv, idx, lb, range});

            // TODO: test if this can be replaced by "mod" (likely can)
            while (v < lb) {
                v = v + range;
            }
            while (v >= ub) {
                v = v - range;
            }
            // logger({v});
            return v;
        };
    }};

    _functions.saw = _functions.range;

    _functions.complex = {fun: (args) => {
        const {p: points, s: step} = expand_args({p: [[0, 0], [1, 1]], s: 0.1}, args);

        return (input, gen_args, run_args) => {
            const [pv, sv] = freeze_values([points, step], run_args, gen_args);
            
            let idx = undefault(input, get_time(gen_args, run_args, true));
            
            idx = undefault(idx, 0) * sv;

            if (pv.length === 0) {
                return 0;
            }

            let pvlen = 0;
            const bounds = [];

            for (let i = 0; i < pv.length; i++) {
                if (!Array.isArray(pv[i])) {
                    pv[i] = [pv[i]];
                }
                const [point_value, point_pos] = pv[i];
                pvlen += undefault(point_pos, 1.0 / pv.length);
                if (idx <= point_pos) {
                    return point_value;
                }
                bounds.push([pvlen, point_value]);
            }
            idx = idx % pvlen;
            for (let i = 0; i < bounds.length; i++) {
                const [ppos, pval] = bounds[i];
                if (idx <= ppos) {
                    return pval;
                }
            }

            return pv[pv.length - 1][0];
        };
    }};

    _functions.choose = {fun: (args) => {
        const {v: values, s: scale} = expand_args({v: [0, 1], s: 1}, args);

        return (input, gen_args, run_args) => {
            const [vv, sv] = freeze_values([values, scale], run_args, gen_args);

            if (vv.length === 0) {
                return 0;
            }
            
            let idx = undefault(input, get_time(gen_args, run_args, true));

            idx = undefault(idx, 0) * sv;

            idx = Math.floor(Math.abs(idx));
            idx = idx % vv.length;

            let val = vv[idx];

            const fmark = `choose_mark_${new Date().getTime()}`;
            let maxcnt = 10;

            while (typeof val === 'function') {
                const fn = val;
                fn.__choose_mark = fmark;

                val = fn(...run_args, gen_args);
                if (maxcnt-- <= 0 || (typeof val === 'function' && val.__choose_mark === fmark)) {
                    // loop detected
                    val = 0;
                    break;
                }

                delete fn.__choose_mark;
            }
            return val;
        };
    }};
    return _functions;
};

export const functions = ({logger = console.log}) => ({
    __category: "generator"
    , __doc: {
        title: "Generator functions"
        , description: `Functions that generate values and can be used as the
the source for other functions and parameters.`
    }
    , ...(make_functions({logger}))
});
