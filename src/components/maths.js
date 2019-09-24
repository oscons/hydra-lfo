import {ud, undefault, expand_args, freeze_values, mix_values, get_time, get_bpm} from "./util";

const _functions = {};

_functions.add = {fun: (args) => {
    const {v: value} = expand_args({v: 0}, args);

    return (input, gen_args, run_args) => {
        const vv = freeze_values(value, run_args, gen_args);
        return undefault(input, 0) + vv;
    };
}};

_functions.sub = {fun: (args) => {
    const {v: value} = expand_args({v: 0}, args);

    return (input, gen_args, run_args) => {
        const vv = freeze_values(value, run_args, gen_args);
        return undefault(input, 0) + vv;
    };
}};

_functions.floor = {fun: (args) => {
    const {d: digits} = expand_args({d: 0}, args);

    return (input, gen_args, run_args) => {
        const dv = freeze_values(digits, run_args, gen_args);
        const fact = Math.pow(10, dv);

        return Math.floor(undefault(input, 0) * fact) / fact;
    };
}};

_functions.mul = {fun: (args) => {
    const {v: value} = expand_args({v: 0}, args);

    return (input, gen_args, run_args) => {
        const vv = freeze_values(value, run_args, gen_args);
        return input * vv;
    };
}};

_functions.div = {fun: (args) => {
    const {v: value} = expand_args({v: 1}, args);

    return (input, gen_args, run_args) => {
        const vv = freeze_values(value, run_args, gen_args);

        const definput = undefault(input, 0);
        
        if (vv === 0) {
            return definput / 0.0000000000001;
        }
        return definput / vv;
    };
}};

_functions.mod = {fun: (args) => {
    const {v: value} = expand_args({v: 1}, args);

    return (input, gen_args, run_args) => {
        const vv = freeze_values(value, run_args, gen_args);
        
        if (vv === 0) {
            return 0;
        }
        return undefault(input, 0) % vv;
    };
}};

export const functions = _functions;
