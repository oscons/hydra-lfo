import {ud, undefault, expand_args, freeze_values, mix_values, get_time, get_bpm} from "./util";

const _functions = {};

_functions.add = (args) => {
    const {v: value} = expand_args({v: 0}, args);

    return (input, gen_args, run_args) => {
        const vv = freeze_values(value, run_args, gen_args);
        return undefault(input, 0) + vv;
    };
};

_functions.sub = (args) => {
    const {v: value} = expand_args({v: 0}, args);

    return (input, gen_args, run_args) => {
        const vv = freeze_values(value, run_args, gen_args);
        return undefault(input, 0) + vv;
    };
};

_functions.sin = (args) => {
    const {f: frequency, s: scale, o: offset} = expand_args({f: 1, s: 1, o: 0}, args);

    return (input, gen_args, run_args) => {
        const [fv, sv, ov] = freeze_values([frequency, scale, offset], run_args, gen_args);
        let time = 0;

        if (typeof input === 'undefined') {
            time = get_time(gen_args, run_args);
            
        } else {
            time = input;
        }
        time = undefault(time, Math.PI);

        return (((Math.sin(time * 2 * Math.PI * fv) / 2) + 0.5) * sv) + ov;
    };
};

_functions.floor = (args) => {
    const {d: digits} = expand_args({d: 0}, args);

    return (input, gen_args, run_args) => {
        const dv = freeze_values(digits, run_args, gen_args);
        const fact = Math.pow(10, dv);

        return Math.floor(input * fact) / fact;
    };
};

_functions.mul = (args) => {
    const {v: value} = expand_args({v: 0}, args);

    return (input, gen_args, run_args) => {
        const vv = freeze_values(value, run_args, gen_args);
        return input * vv;
    };
};

_functions.div = (args) => {
    const {v: value} = expand_args({v: 1}, args);

    return (input, gen_args, run_args) => {
        const vv = freeze_values(value, run_args, gen_args);

        const definput = undefault(input, 0);
        
        if (vv === 0) {
            return definput / 0.0000000000001;
        }
        return definput / vv;
    };
};

_functions.mod = (args) => {
    const {v: value} = expand_args({v: 1}, args);

    return (input, gen_args, run_args) => {
        const vv = freeze_values(value, run_args, gen_args);
        
        if (vv === 0) {
            return 0;
        }
        return undefault(input, 0) % vv;
    };
};

export const functions = _functions;
