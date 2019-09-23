
// eslint-disable-next-line no-empty-function
const ud = ((function () {})());

export const mix_values = (a, b, m) => (m === 0 ? a : (m === 1 ? b : (a * (1 - m)) + (b * m)));

export const undefault = (x, def) => {
    if (typeof x === 'undefined') {
        return def;
    }
    return x;
};

export const expand_args = (arg_def, args) => {
    const vals = {...undefault(arg_def, {})};

    if (typeof args !== 'undefined' && args.length > 0) {
        const [first] = args;
        if (typeof first === 'object' && !Array.isArray(first)) {
            for (const x in arg_def) {
                if (x in first) {
                    vals[x] = first[x];
                }
            }
        } else {
            let defkeys = Object.keys(arg_def);
            defkeys = defkeys.slice(0, Math.min(defkeys.length, args.length));
            defkeys.forEach((k, i) => {
                vals[k] = args[i];
            });
        }
    }

    Object.keys(vals).forEach((x) => {
        const vx = vals[x];
        const ax = arg_def[x];

        if (typeof vx === 'function') {
            vals[x] = (call_args, call_gen_args) => {
                let nargs = call_args;
                if (typeof nargs === 'undefined') {
                    nargs = [];
                }
                return undefault(vx(...nargs, call_gen_args), ax);
            };
        } else if (typeof vx === 'undefined') {
            vals[x] = () => ax;
        } else {
            vals[x] = () => vx;
        }
    });

    return vals;
};

export const get_time = (args) => {
    let time = ud;
    if (typeof args === 'object' && !Array.isArray(args)) {
        const {time: atime} = args;
        time = atime;
    }

    if (typeof time !== 'undefined') {
        return time;
    }
    if (typeof window !== 'undefined' && typeof window.time !== 'undefined') {
        return window.time;
    }
    return new Date().getTime() / 1000.0;
};

export const freeze_values = (v, args, gen_args) => {
    if (typeof v === 'undefined') {
        return v;
    }
    if (typeof v === 'function') {
        return v(...args, gen_args);
    }
    if (Array.isArray(v)) {
        return v.map((x) => freeze_values(x, args, gen_args));
    }
    return v;
};

const _functions = {};

_functions.add = (args) => {
    const {v: value} = expand_args({v: 0}, args);

    return (run_args, gen_args) => {
        const vv = freeze_values(value, run_args, gen_args);
        return undefault(gen_args.input, 0) + vv;
    };
};

_functions.speed = (args) => {
    const {v: value, m: mix} = expand_args({v: ud, m: ud}, args);

    return (run_args, gen_args) => {
        const [vv, mv] = freeze_values([value, mix], run_args, gen_args);
        
        let time_scale = 1;
        if (typeof vv === 'undefined') {
            if (typeof input !== 'undefined') {
                time_scale = gen_args.input;
            }
        } else if (typeof input === 'undefined') {
            time_scale = vv;
        } else if (typeof mv === 'undefined') {
            time_scale = vv;
        } else {
            time_scale = mix_values(vv, gen_args.input, mv);
        }

        gen_args.values.time = time_scale * gen_args.values.time;

        return gen_args.input;
    };
};

_functions.fast = (args) => {
    const {s: scale, o: offset, m: mix} = expand_args({s: ud, o: 0, m: 0}, args);
    return (run_args, gen_args) => {
        const [sv, ov, mv] = freeze_values([scale, offset, mix], run_args, gen_args);
        
        let time_scale = 1;
        if (typeof input === 'undefined') {
            if (typeof sv !== 'undefined') {
                time_scale = sv;
            }
        } else if (typeof sv === 'undefined') {
            time_scale = gen_args.input;
        } else {
            time_scale = mix_values(sv, gen_args.input, mv);
        }

        gen_args.values.time = (time_scale * gen_args.values.time) + ov;
        
        return gen_args.input;
    };
};

_functions.time = (args) => {
    const {s: scale, o: offset} = expand_args({s: 1, o: 0}, args);

    return (run_args, gen_args) => {
        const [sv, ov] = freeze_values([scale, offset], run_args, gen_args);

        return (get_time(...run_args) * sv) + ov;
    };
};

_functions.rnd = (args) => {
    const {s: scale, o: offset, m: mix} = expand_args({s: 1, o: 0, m: 0}, args);

    return (run_args, gen_args) => {
        const [sv, ov, mv] = freeze_values([scale, offset, mix], run_args, gen_args);

        let svx = 1;
        if (typeof input === 'undefined') {
            if (typeof sv !== 'undefined') {
                svx = sv;
            }
        } else if (typeof sv === 'undefined') {
            svx = gen_args.input;
        } else {
            svx = mix_values(svx, gen_args.input, mv);
        }

        return (Math.random() * svx) + ov;
    };
};

_functions.range = (args) => {
    const {u: upper, l: lower, s: step} = expand_args({u: 10, l: 0, s: 1}, args);

    return (run_args, gen_args) => {
        const [sv, uv, lv] = freeze_values([step, upper, lower], run_args, gen_args);
        
        let npi = 0;
        if (gen_args.private_state.prev) {
            const {spi = 0} = gen_args.private_state.prev;

            npi = spi + sv + gen_args.input;

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

    return (run_args, gen_args) => {
        const [vv, sv] = freeze_values([values, step], run_args, gen_args);

        let {pi = 0} = gen_args.private_state.prev ? gen_args.private_state.prev : {};

        if (gen_args.private_state.prev) {
            pi = sv + pi + undefault(gen_args.input, 0);
        }
        gen_args.private_state.prev = {pi};

        const vs = vv;
        let idx = Math.floor(pi);

        idx = idx % vs.length;

        const val = vs[idx];

        if (typeof val === 'function') {
            return val(...run_args);
        }
        return val;
    };
};

_functions.choose = (args) => {
    const {v: values, s: scale} = expand_args({v: [0, 1], s: 1}, args);

    return (run_args, gen_args) => {
        const [vv, sv] = freeze_values([values, scale], run_args, gen_args);

        if (vv.length === 0) {
            return 0;
        }
        
        let idx = undefault(gen_args.input, 0);
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

_functions.sin = (...args) => {
    const {f: frequency, s: scale, o: offset} = expand_args({f: 1, s: 1, o: 0}, args);

    return (run_args, gen_args) => {
        const [fv, sv, ov] = freeze_values([frequency, scale, offset], run_args, gen_args);
        let time = 0;

        if (gen_args.input) {
            time = gen_args.input;
        } else {
            time = get_time(...run_args, gen_args);
        }

        return (((Math.sin(time * 2 * Math.PI * fv) / 2) + 0.5) * sv) + ov;
    };
};

_functions.floor = (args) => {
    const {d: digits} = expand_args({d: 0}, args);

    return (run_args, gen_args) => {
        const dv = freeze_values(digits, run_args, gen_args);
        const fact = Math.power(10, dv);

        return Math.floor(gen_args.input * fact) / fact;
    };
};

_functions.set = (args) => {
    const {v: value} = expand_args({v: 0}, args);

    return (run_args, gen_args) => {
        const vv = freeze_values(value, run_args, gen_args);
        return vv;
    };
};

_functions.mul = (args) => {
    const {v: value} = expand_args({v: 0}, args);

    return (run_args, gen_args) => {
        const vv = freeze_values(value, run_args, gen_args);
        return gen_args.input * vv;
    };
};

_functions.div = (args) => {
    const {v: value} = expand_args({v: 1}, args);

    return (run_args, gen_args) => {
        const vv = freeze_values(value, run_args, gen_args);

        const definput = undefault(gen_args.input, 0);
        
        if (vv === 0) {
            return definput / 0.0000000000001;
        }
        return definput / vv;
    };
};

_functions.mod = (args) => {
    const {v: value} = expand_args({v: 1}, args);

    return (run_args, gen_args) => {
        const vv = freeze_values(value, run_args, gen_args);
        
        if (vv === 0) {
            return 0;
        }
        return undefault(gen_args.input, 0) % vv;
    };
};

_functions.slew = (args) => {
    const {r: rate, x: max} = expand_args({r: 1, x: Number.MAX_VALUE}, args);

    return (run_args, gen_args) => {
        const [rv, xv] = freeze_values([rate, max], run_args, gen_args);

        if (!gen_args.private_state.prev) {
            gen_args.private_state.prev = gen_args.input;
        }
        let genin = gen_args.input;
        if (typeof genin === 'undefined') {
            genin = gen_args.private_state.prev;
        }

        let diff = (genin - gen_args.private_state.prev);

        if (rv > 0) {
            diff = diff * (1 - (1 / rv));
        }
        if (diff > 0) {
            if (diff > xv) {
                diff = xv;
            }
        } else if (diff < -xv) {
            diff = -xv;
        }

        const nv = gen_args.private_state.prev + diff;

        gen_args.private_state.prev = nv;

        return nv;
    };
};

_functions.map = (args) => {
    const {f: func} = expand_args({f: (x) => x}, args);

    return (run_args, gen_args) => func(...run_args, gen_args);
};

_functions.beats = (args) => {
    const {s: scale, b: sbpm} = expand_args({s: 1, b: ud}, args);

    return (run_args, gen_args) => {
        const [sv, bv] = freeze_values([scale, sbpm], run_args, gen_args);
        const {time, bpm} = run_args;
        
        let abpm = bv;
        if (typeof abpm === 'undefined') {
            abpm = bpm;
        }

        gen_args.values.time = undefault(time, 0) / 60 * abpm * sv;

        return gen_args.input;
    };
};

_functions.use = (args) => {
    const {n: name, c: copy} = expand_args({n: "val", c: false}, args);

    return (run_args, gen_args) => {
        const [nv, cv] = freeze_values([name, copy], run_args, gen_args);

        let ret = gen_args.values[nv];
        
        if (cv) {
            ret = gen_args.input;
        }
        gen_args.current_value = nv;

        return ret;
    };
};

_functions.noop = () => ((_, gen_args) => gen_args.input);
_functions.gen = _functions.noop;

_functions.used = () => ((_, gen_args) => gen_args.current_value);

const run_calls = (global_state, instance_state, calls, args) => {
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
        , global_state
        , instance_state
        , private_state: {}
    };

    gen_args.values.initial_time = get_time(gen_args.values);
    gen_args.values.time = gen_args.values.initial_time;

    run_args[0] = gen_args.values;

    calls.forEach(([fncall, private_state]) => {
        gen_args.private_state = private_state;
        gen_args.input = gen_args.values[gen_args.current_value];

        const res = fncall(run_args, gen_args);

        gen_args.values[gen_args.current_value] = res;
    });
    
    const rval = gen_args.values[gen_args.current_value];
    if (typeof rval === 'undefined') {
        return 0;
    }

    return rval;
};

const sub_call = (global_state, prev_calls, fun) => {
    const calls = prev_calls.map((x) => [x, {}]);
    const instance_state = {};

    if (typeof fun !== 'undefined') {
        calls.push([fun, {}]);
    }

    const rfun = (...args) => run_calls(global_state, instance_state, calls, args);
    rfun.run = rfun;

    Object.entries(_functions).forEach(([name, gen]) => {
        rfun[name] = (...args) => sub_call(
            global_state
            , calls.map(([call]) => call)
            , gen(args)
        );
    });

    return rfun;
};

export const start = (global_state = {}) => sub_call(global_state, []);

const setup_init_call = (fun, ...args) => (start()[fun])(...args);

/* eslint-disable no-multi-spaces */
export const add    = (...args) => setup_init_call("add", ...args);
export const time   = (...args) => setup_init_call("time", ...args);
export const speed  = (...args) => setup_init_call("speed", ...args);
export const fast   = (...args) => setup_init_call("fast", ...args);
export const mul    = (...args) => setup_init_call("mul", ...args);
export const mod    = (...args) => setup_init_call("mod", ...args);
export const div    = (...args) => setup_init_call("div", ...args);
export const range  = (...args) => setup_init_call("rang", ...args);
export const iter   = (...args) => setup_init_call("iter", ...args);
export const choose = (...args) => setup_init_call("choose", ...args);
export const slew   = (...args) => setup_init_call("slew", ...args);
export const set    = (...args) => setup_init_call("set", ...args);
export const rnd    = (...args) => setup_init_call("rnd", ...args);
export const use    = (...args) => setup_init_call("use", ...args);
export const used   = (...args) => setup_init_call("used", ...args);
export const noop   = (...args) => setup_init_call("noop", ...args);
export const gen   =  (...args) => setup_init_call("gen", ...args);
