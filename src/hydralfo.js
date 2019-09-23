// eslint-disable-next-line no-empty-function
const ud = ((function () {})());

const CANARY = "__hydralfo_func";

const mix_values = (a, b, m) => (m === 0 ? a : (m === 1 ? b : (a * (1 - m)) + (b * m)));

const undefault = (x, def) => {
    if (typeof x === 'undefined') {
        return def;
    }
    return x;
};

const expand_args = (arg_def, args) => {
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
            vals[x] = (input, call_gen_args, call_args) => {
                let nargs = call_args;
                if (typeof nargs === 'undefined') {
                    nargs = [{}];
                }
                if (CANARY in vx) {
                    // make a 1 level copy of the call args for the call to the sub-chain
                    const new_call_args = [];

                    nargs.forEach((arg) => {
                        if (typeof arg === 'object') {
                            if (Array.isArray(arg)) {
                                new_call_args.push([...arg]);
                            } else if ("call" in arg) {
                                new_call_args.push(arg);
                            } else {
                                new_call_args.push({...arg});
                            }
                        } else {
                            new_call_args.push(arg);
                        }
                    });

                    return undefault(vx.run(new_call_args), ax);
                }

                return undefault(vx(input, call_gen_args, nargs), ax);
            };
        } else if (typeof vx === 'undefined') {
            vals[x] = () => ax;
        } else {
            vals[x] = () => vx;
        }
    });

    return vals;
};

const get_time = (gen_args, run_args, allow_undef = false) => {
    let time = ud;
    let namedargs = run_args;

    if (Array.isArray(namedargs) && namedargs.length > 0) {
        [namedargs] = namedargs;
    }

    if (typeof namedargs === 'object' && !Array.isArray(namedargs)) {
        const {time: atime} = run_args;
        time = atime;
    }

    if (typeof time !== 'undefined') {
        return time;
    }
    if (typeof gen_args !== 'undefined') {
        if (typeof gen_args.values !== 'undefined' && typeof gen_args.values.time !== 'undefined') {
            return gen_args.values.time;
        }
    }
    if (typeof window !== 'undefined' && typeof window.time !== 'undefined') {
        return window.time;
    }
    if (allow_undef) {
        return time;
    }
    return new Date().getTime() / 1000.0;
};

const freeze_values = (v, args, gen_args) => {
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

    return (input, gen_args, run_args) => {
        const vv = freeze_values(value, run_args, gen_args);
        return undefault(input, 0) + vv;
    };
};

_functions.speed = (args) => {
    const {v: value, m: mix} = expand_args({v: ud, m: ud}, args);

    return (input, gen_args, run_args) => {
        const [vv, mv] = freeze_values([value, mix], run_args, gen_args);
        
        let time_scale = 1;
        if (typeof vv === 'undefined') {
            if (typeof input !== 'undefined') {
                time_scale = input;
            }
        } else if (typeof input === 'undefined') {
            time_scale = vv;
        } else if (typeof mv === 'undefined') {
            time_scale = vv;
        } else {
            time_scale = mix_values(vv, input, mv);
        }

        gen_args.values.time = time_scale * gen_args.values.time;

        return input;
    };
};

_functions.fast = (args) => {
    const {s: scale, o: offset, m: mix} = expand_args({s: ud, o: 0, m: 0}, args);
    return (input, gen_args, run_args) => {
        const [sv, ov, mv] = freeze_values([scale, offset, mix], run_args, gen_args);
        
        let time_scale = 1;
        if (typeof input === 'undefined') {
            if (typeof sv !== 'undefined') {
                time_scale = sv;
            }
        } else if (typeof sv === 'undefined') {
            time_scale = input;
        } else {
            time_scale = mix_values(sv, input, mv);
        }

        gen_args.values.time = (time_scale * gen_args.values.time) + ov;
        
        return input;
    };
};

_functions.time = (args) => {
    const {s: scale, o: offset} = expand_args({s: 1, o: 0}, args);

    return (input, gen_args, run_args) => {
        const [sv, ov] = freeze_values([scale, offset], run_args, gen_args);

        return (get_time(gen_args, run_args) * sv) + ov;
    };
};

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

_functions.set = (args) => {
    const {v: value} = expand_args({v: 0}, args);

    return (input, gen_args, run_args) => {
        const vv = freeze_values(value, run_args, gen_args);
        return vv;
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

_functions.sah = (args) => {
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
};

_functions.slew = (args) => {
    const {r: rate, x: max} = expand_args({r: 1, x: Number.MAX_VALUE}, args);

    return (input, gen_args, run_args) => {
        const [rv, xv] = freeze_values([rate, max], run_args, gen_args);

        if (!gen_args.private_state.prev) {
            gen_args.private_state.prev = input;
        }
        let genin = input;
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

    return (value, gen_args, run_args) => {
        return func(value, gen_args, ...run_args);
    };
};

_functions.beats = (args) => {
    const {s: scale, b: sbpm} = expand_args({s: 1, b: ud}, args);

    return (input, gen_args, run_args) => {
        const [sv, bv] = freeze_values([scale, sbpm], run_args, gen_args);
        const {time, bpm} = run_args;
        
        let abpm = bv;
        if (typeof abpm === 'undefined') {
            abpm = bpm;
        }

        gen_args.values.time = undefault(time, 0) / 60 * abpm * sv;

        return input;
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

_functions.noop = () => ((input) => input);
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

    gen_args.values.initial_time = get_time(gen_args.values, gen_args.values);
    gen_args.values.time = gen_args.values.initial_time;

    run_args[0] = gen_args.values;

    calls.forEach(([fncall, private_state]) => {
        gen_args.private_state = private_state;
        gen_args.input = gen_args.values[gen_args.current_value];

        const res = fncall(gen_args.input, gen_args, run_args);

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
    rfun[CANARY] = true;

    Object.entries(_functions).forEach(([name, gen]) => {
        if (name in rfun && !(name in Object.getOwnPropertyNames())) {
            throw new Error(`${name} already exists on parents of rfun`);
        }

        rfun[name] = (...args) => sub_call(
            global_state
            , calls.map(([call]) => call)
            , gen(args)
        );
    });

    return rfun;
};

const get_global_env = () => {
    if (typeof window !== 'undefined') {
        return window;
    }
    return global;
};

const make_new_lfo = (state) => {
    const fdef = {};
    const global_state = typeof state === 'undefined' ? {} : state;
    
    Object.keys(_functions).forEach((name) => {
        fdef[name] = (...args) => sub_call(global_state, [])[name](...args);
    });

    fdef.__release = (new_lfo) => {
        // for future use, e.g. to stop timeouts etc
    };

    return fdef;
};

const GLOBAL_INIT_ID = "__hydralfo_global";

export const init = (state = ud, init_global = true, force = false) => {
    const new_lfo = make_new_lfo(state);

    if (!init_global) {
        return new_lfo;
    }

    const env = get_global_env();

    if (typeof env !== 'undefined') {
        if (CANARY in env) {
            const old_lfo = env[CANARY];
            if (typeof old_lfo === 'object') {
                if (!force) {
                    return env[CANARY];
                }
                if ('__release' in old_lfo) {
                    old_lfo.__release(new_lfo);
                }
            }
        }
        env[CANARY] = new_lfo;
    }

    return new_lfo;
};
