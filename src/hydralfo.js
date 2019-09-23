
// eslint-disable-next-line no-empty-function
const ud = ((function () {})());

export const mix_values = (a, b, m) => (m === 0 ? a : (m === 1 ? b : (a * (1 - m)) + (b * m)));

export const undefault = (x, def) => {
    if (typeof x === 'undefined') {
        return def;
    }
    return x;
};

export const expand_args = (adef, rest) => {
    const vals = {...adef};

    if (typeof rest !== 'undefined' && rest.length > 0) {
        if (rest.length === 1 && typeof rest[0] === 'object' && !Array.isArray(rest[0])) {
            const [first] = rest;
            for (const x in adef) {
                if (x in first) {
                    vals[x] = first[x];
                }
            }
        } else {
            let ok = Object.keys(adef);
            ok = ok.slice(0, Math.min(ok.length, rest.length));
            for (let i = 0; i < ok.length; i++) {
                vals[ok[i]] = rest[i];
            }
        }
    }

    Object.keys(vals).forEach((x) => {
        const vx = vals[x];
        const ax = adef[x];
        if (typeof vals[x] === 'function') {
            if (typeof vx._private_state === 'undefined') {
                vals[x] = (...args) => {
                    const rv = vx(...args);
                    if (typeof rv === 'undefined') {
                        return ax;
                    }
                    return rv;
                };
            } else {
                vals[x] = vx.g();
            }
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

    if (time) {
        return time;
    }
    if (typeof window !== 'undefined' && typeof window.time !== 'undefined') {
        return window.time;
    }
    return new Date().getTime() / 1000.0;
};

export const freeze_values = (v, args) => {
    if (typeof v === 'undefined') {
        return v;
    }
    if (typeof v === 'function') {
        return v(args);
    }
    if (Array.isArray(v)) {
        return v.map((x) => freeze_values(x, args));
    }
    return v;
};

const _functions = {};

_functions.add = (that, args) => {
    const {v: value} = expand_args({v: 0}, args);

    return (input, run_args) => {
        const vv = freeze_values(value, run_args);
        return undefault(input, 0) + vv;
    };
};

_functions.speed = (that, args) => {
    const {v: value, m: mix} = expand_args({v: ud, m: ud}, args);

    return (input, run_args, private_state, run_state) => {
        const [vv, mv] = freeze_values([value, mix], run_args);
        
        if (typeof vv === 'undefined') {
            if (typeof input !== 'undefined') {
                run_state.time_scale = input;
            }
        } else if (typeof input === 'undefined') {
            run_state.time_scale = vv;
        } else if (typeof mv === 'undefined') {
            run_state.time_scale = vv;
        } else {
            run_state.time_scale = mix_values(vv, input, mv);
        }

        return input;
    };
};

_functions.fast = (that, args) => {
    const {s: scale, o: offset, m: mix} = expand_args({s: ud, o: 0, m: 0}, args);
    return (input, run_args, private_state, run_state) => {
        const [sv, ov, mv] = freeze_values([scale, offset, mix], run_args);
        
        if (typeof input === 'undefined') {
            if (typeof sv !== 'undefined') {
                run_state.time_scale = run_state.time_scale * sv;
            }
        } else if (typeof sv === 'undefined') {
            run_state.time_scale = run_state.time_scale * input;
        } else {
            run_state.time_scale = run_state.time_scale * mix_values(sv, input, mv);
        }

        run_state.time_scale = run_state.time_scale + ov;
        
        return input;
    };
};

_functions.time = (that, args) => {
    const {s: scale, o: offset} = expand_args({s: 1, o: 0}, args);

    return (input, run_args) => {
        const [sv, ov] = freeze_values([scale, offset], run_args);

        return (get_time(...run_args) * sv) + ov;
    };
};

_functions.rnd = (that, args) => {
    const {s: scale, o: offset, m: mix} = expand_args({s: 1, o: 0, m: 0}, args);

    return (input, run_args) => {
        const [sv, ov, mv] = freeze_values([scale, offset, mix], run_args);

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

_functions.range = (that, args) => {
    const {u: upper, l: lower, s: step} = expand_args({u: 10, l: 0, s: 1}, args);

    return (input, run_args, private_state) => {
        const [sv, uv, lv] = freeze_values([step, upper, lower], run_args);
        
        let npi = 0;
        if (private_state.prev) {
            const {spi = 0} = private_state.prev;

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

        private_state.prev = {spi: npi};

        return npi;
    };
};

_functions.iter = (...args) => {
    const {v: values, s: step} = expand_args({v: [0, 1], s: 1}, args);

    return (input, run_args, private_state) => {
        const [vv, sv] = freeze_values([values, step], run_args);

        let {pi = 0} = private_state.prev ? private_state.prev : {};

        if (private_state.prev) {
            pi = sv + pi + input;
        }
        private_state.prev = {pi};

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

_functions.choose = (...args) => {
    const {v: values, s: scale} = expand_args({v: [0, 1], s: 1}, args);

    return (input, run_args) => {
        const [vv, sv] = freeze_values([values, scale], run_args);
        let idx = input;
        idx = idx * sv;
        if (idx < 0) {
            idx = -idx;
        }
        idx = Math.floor(idx);

        const vs = vv;

        idx = idx % vs.length;

        const val = vs[idx];

        if (typeof val === 'function') {
            return val(...run_args);
        }
        return val;
    };
};

_functions.sin = (...args) => {
    const {f: frequency, s: scale, o: offset} = expand_args({f: 1, s: 1, o: 0}, args);

    return (input, run_args) => {
        const [fv, sv, ov] = freeze_values([frequency, scale, offset], run_args);
        let time = 0;

        if (input) {
            time = input;
        } else {
            time = get_time(...run_args);
        }

        return (((Math.sin(time * 2 * Math.PI * fv) / 2) + 0.5) * sv) + ov;
    };
};

_functions.floor = (that, args) => {
    const {d: digits} = expand_args({d: 0}, args);

    return (input, run_args) => {
        const dv = freeze_values(digits, run_args);
        const fact = Math.power(10, dv);

        return Math.floor(input * fact) / fact;
    };
};

_functions.set = (that, args) => {
    const {v: value} = expand_args({v: 0}, args);

    return (input, run_args) => {
        const vv = freeze_values(value, run_args);
        return vv;
    };
};

_functions.mul = (that, args) => {
    const {v: value} = expand_args({v: 0}, args);

    return (input, run_args) => {
        const vv = freeze_values(value, run_args);
        return input * vv;
    };
};

_functions.div = (that, args) => {
    const {v: value} = expand_args({v: 1}, args);

    return (input, run_args) => {
        const vv = freeze_values(value, run_args);

        const definput = undefault(input, 0);
        
        if (vv === 0) {
            return definput / 0.0000000000001;
        }
        return definput / vv;
    };
};

_functions.mod = (that, args) => {
    const {v: value} = expand_args({v: 1}, args);

    return (input, run_args) => {
        const vv = freeze_values(value, run_args);
        
        if (vv === 0) {
            return 0;
        }
        return input % vv;
    };
};

_functions.slew = (that, args) => {
    const {r: rate, x: max} = expand_args({r: 1, x: Number.MAX_VALUE}, args);

    return (input, run_args, private_state) => {
        const [rv, xv] = freeze_values([rate, max], run_args);

        if (!private_state.prev) {
            private_state.prev = input;
        }

        let diff = (input - private_state.prev);

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

        const nv = private_state.prev + diff;

        private_state.prev = nv;

        return nv;
    };
};

_functions.apply = (that, args) => {
    const {f: func} = expand_args({f: (x) => x}, args);

    return (input, run_args, private_state) => func(input, run_args, private_state);
};

const GenChain = function (state = {}) {
    const that = this;

    that.state = state;
    that.calls = [];

    that.run = (...args) => {
        let run_args = args;
        if (typeof run_args === 'undefined' || run_args.length === 0) {
            run_args = [{}];
        }
        if (typeof run_args[0] === 'undefined') {
            run_args[0] = {};
        }

        const run_state = {
            initial_args: args
            , time_scale: 1
            , initial_time: get_time(...run_args)
        };
        let input = ud;
        for (let i = 0; i < that.calls.length; i++) {
            const {call: fncall, state: private_state} = that.calls[i];

            run_args[0].time = run_state.initial_time * run_state.time_scale;

            const res = fncall(input, run_args, private_state, run_state);

            if (typeof res === 'undefined') {
                input = 0;
            } else {
                input = res;
            }
        }

        return input;
    };

    that._add_call = (call) => {
        that.calls.push({call, state: {}});
    };

    that._that_fun = (...args) => that.run(...args);
    that._that_fun.run = that.run;

    that._wire_call = (name, gen) => {
        that[name] = (...args) => {
            that._add_call(gen(that, args));
            return that._that_fun;
        };
        that._that_fun[name] = that[name];
    };

    Object.entries(_functions)
        .forEach(([name, fn]) => that._wire_call(name, fn));

};

export const start = () => new GenChain();

const setup_init_call = (fun, ...args) => start()[fun](...args);

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
