import {ud, undefault, expand_args, freeze_values, mix_values, get_time, get_bpm} from "./util";

const _functions = {};

const TAU = 2 * Math.PI;

// TODO: use LUTs
_functions.sin = {fun: (args) => {
    const {f: frequency, s: scale, o: offset} = expand_args({f: 1, s: 1, o: 0}, args);

    return (input, gen_args, run_args) => {
        const [fv, sv, ov] = freeze_values([frequency, scale, offset], run_args, gen_args);
        let time = 0;

        if (typeof input === 'undefined') {
            time = get_time(gen_args, run_args, true);
        } else {
            time = input;
        }
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
            if (typeof sv !== 'undefined') {
                svx = sv;
            }
        } else if (typeof sv === 'undefined') {
            svx = input;
        } else {
            svx = mix_values(svx, input, mv);
        }

        return (Math.random() * svx) + ov;
    };
}};

_functions.rand = _functions.rnd;

_functions.range = {fun: (args) => {
    const {u: upper, l: lower, s: step} = expand_args({u: 10, l: 0, s: 1}, args);

    return (input, gen_args, run_args) => {
        const [uv, lv, sv] = freeze_values([upper, lower, step], run_args, gen_args);
        
        let idx = input;
        if (typeof idx === 'undefined') {
            idx = get_time(gen_args, run_args);
        }

        let ub = uv;
        let lb = lv;

        // console.log({t: run_args[0].time, input, idx, ub, lb, sv});
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
        // console.log({v, sv, idx, lb, range});

        // TODO: test if this can be replaced by "mod" (likely can)
        while (v < lb) {
            v = v + range;
        }
        while (v >= ub) {
            v = v - range;
        }
        // console.log({v});
        return v;
    };
}};

_functions.choose = {fun: (args) => {
    const {v: values, s: scale} = expand_args({v: [0, 1], s: 1}, args);

    return (input, gen_args, run_args) => {
        const [vv, sv] = freeze_values([values, scale], run_args, gen_args);

        if (vv.length === 0) {
            return 0;
        }
        
        let idx = undefault(input, 0);
        idx = idx * sv;

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

export const functions = _functions;
