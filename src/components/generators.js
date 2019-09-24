import {ud, undefault, expand_args, freeze_values, mix_values, get_time, get_bpm} from "./util";

const _functions = {};

_functions.rnd = (args) => {
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
};

_functions.rand = _functions.rnd;

_functions.range = (args) => {
    const {u: upper, l: lower, s: step} = expand_args({u: 10, l: 0, s: 1}, args);

    return (input, gen_args, run_args) => {
        const [sv, uv, lv] = freeze_values([step, upper, lower], run_args, gen_args);
        
        let npi = 0;
        if (gen_args.private_state.prev) {
            const {spi = 0} = gen_args.private_state.prev;

            npi = spi + sv + input;

            if (npi >= uv) {
                npi = lv;
            }

            if (npi < lv && sv < 0) {
                npi = uv;
            }
        } else if (sv > 0) {
            npi = lv;
        } else {
            npi = uv;
        }

        gen_args.private_state.prev = {spi: npi};

        return npi;
    };
};

_functions.iter = (args) => {
    const {v: values, s: step} = expand_args({v: [0, 1], s: 1}, args);

    return (input, gen_args, run_args) => {
        const [vv, sv] = freeze_values([values, step], run_args, gen_args);

        let {pi = 0} = gen_args.private_state.prev ? gen_args.private_state.prev : {};

        if (gen_args.private_state.prev) {
            pi = sv + pi + undefault(input, 0);
        }
        gen_args.private_state.prev = {pi};

        const vs = vv;
        let idx = Math.floor(pi);

        idx = idx % vs.length;

        const val = vs[idx];

        if (typeof val === 'function') {
            return val(input, gen_args, run_args);
        }
        return val;
    };
};

_functions.choose = (args) => {
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
};

export const functions = _functions;
