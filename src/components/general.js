import {ud, undefault, expand_args, freeze_values, mix_values, get_time, get_bpm} from "./util";

const _functions = {};

_functions.set = (args) => {
    const {v: value} = expand_args({v: 0}, args);

    return (input, gen_args, run_args) => {
        const vv = freeze_values(value, run_args, gen_args);
        return vv;
    };
};

_functions.use = (args) => {
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
};

_functions.used = () => ((_, gen_args) => gen_args.current_value);

_functions.noop = () => ((input) => input);

export const functions = _functions;
