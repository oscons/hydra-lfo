import {ud, undefault, expand_args, freeze_values, mix_values, get_time, get_bpm} from "./util";

const _functions = {};

_functions.sah = {fun: (args) => {
    const {h: hold_time} = expand_args({h: 1}, args);

    return (input, gen_args, run_args) => {
        const [hv] = freeze_values([hold_time], run_args, gen_args);

        let prev_time = 0;
        if (typeof gen_args.private_state.time !== 'undefined') {
            prev_time = gen_args.private_state.time;
        }
        if (typeof gen_args.private_state.value === 'undefined') {
            gen_args.private_state.value = input;
        }

        if ((gen_args.values.time - prev_time) >= hv) {
            gen_args.private_state.value = input;
            gen_args.private_state.time = gen_args.values.time;
        }
        
        return gen_args.private_state.value;
    };
}};

const DEFAULT_SLEW_TYPE = 'h';
const SLEW_TYPES = {
    h: (x, over) => x - over
};

_functions.slew = {fun: (args) => {
    const {r: rate, t: type, i: ival} = expand_args({r: 0.5, t: DEFAULT_SLEW_TYPE, i: 1}, args);

    return (input, gen_args, run_args) => {
        const [rv, iv] = freeze_values([rate, ival], run_args, gen_args);

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
        const vdiff = tgt - gen_args.private_state.prev;

        gen_args.private_state.time = time;
        gen_args.private_state.tgt = tgt;

        const over = vdiff - ((tdiff / iv) * rv);

        let nv = tgt;
        if (over > 0) {
            let tv = freeze_values(type, run_args, gen_args);

            if (typeof tv !== 'string') {
                tv = DEFAULT_SLEW_TYPE;
            }
            tv = SLEW_TYPES[tv];
            if (typeof tv === 'undefined') {
                tv = SLEW_TYPES[DEFAULT_SLEW_TYPE];
            }
            nv = tv(nv, over);
        }
        
        gen_args.private_state.prev = nv;
        return nv;
    };
}};

_functions.map = {fun: (args) => {
    const {f: func} = expand_args({f: (x) => x}, args);

    return (value, gen_args, run_args) => func(value, gen_args, ...run_args);
}};

export const functions = _functions;
