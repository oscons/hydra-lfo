'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/* Copyright (C) 2019  oscons (github.com/oscons). All rights reserved.
 * Licensed under the GNU General Public License, Version 2.0.
 * See LICENSE file for more information */

const UUID = require("pure-uuid");

// eslint-disable-next-line no-empty-function
const ud = ((function () {})());

const CANARY = "__hydralfo_func";

const mix_values = (a, b, m) => (m === 0 ? a : (m === 1 ? b : (a * (1 - m)) + (b * m)));

const undefault = (x, def) => (typeof x === 'undefined' ? def : x);

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
            vals[x] = ax;
        } else {
            vals[x] = vx;
        }
    });

    return vals;
};

const get_time = (gen_args, run_args, allow_undef = false) => {
    let namedargs = run_args;

    if (Array.isArray(namedargs) && namedargs.length > 0) {
        [namedargs] = namedargs;
    }

    if (typeof namedargs === 'object' && !Array.isArray(namedargs)) {
        const {time} = namedargs;
        if (typeof time !== 'undefined') {
            return time;
        }
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
        return ud;
    }
    return new Date().getTime() / 1000.0;
};

const get_bpm = (gen_args, run_args, allow_undef = false) => {
    let namedargs = run_args;

    if (Array.isArray(namedargs) && namedargs.length > 0) {
        [namedargs] = namedargs;
    }

    if (typeof namedargs === 'object' && !Array.isArray(namedargs)) {
        const {bpm} = namedargs;
        if (typeof bpm !== 'undefined') {
            return bpm;
        }
    }

    if (typeof gen_args !== 'undefined'
        && typeof gen_args.values !== 'undefined'
        && gen_args.values.bpm !== 'undefined'
    ) {
        return gen_args.values.bpm;
    }

    if (allow_undef) {
        return ud;
    }
    return 60;
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

const get_global_env = () => {
    if (typeof window !== 'undefined') {
        return window;
    }
    return global;
};

const uuid = () => new UUID(4).format();

const time_to_beats = (time, bpm) => time / 60 * bpm;
const beats_to_time = (beats, bpm) => beats * 60 / bpm;

/* Copyright (C) 2019  oscons (github.com/oscons). All rights reserved.
 * Licensed under the GNU General Public License, Version 2.0.
 * See LICENSE file for more information */

const TAU = 2 * Math.PI;

const make_functions = ({logger = console.log}) => {
    const _functions = {};

    _functions.add = {doc: ({doc_link}) => ({
        title: "Add a value"
        , command: ["add(v)", "add({v})"]
        , params: {
            v: "The value to add. Default is 0"
        }
        , return: "The previous value plus the added value `v`."
        , description: `Add a value to the current value, depending on ${doc_link('use', "`use`")}`
        , examples: [
            "shape(L.time().mod(3).add(2).floor()).out(o0)"
            , "shape(3,L.time().mod(3).div(6).add(L.sin({f:1/2,s:0.2,o:0.1}))).out(o0)"
        ]
    })
    , fun: (args) => {
        const {v: value} = expand_args({v: 0}, args);

        return (input, gen_args, run_args) => {
            const vv = freeze_values(value, run_args, gen_args);
            return undefault(input, 0) + vv;
        };
    }};

    _functions.sub = {doc: ({doc_link}) => ({
        title: "Subtract a value"
        , command: ["sub(v)", "sub({v})"]
        , params: {
            v: "The value to subtract. Default is 0"
        }
        , return: "The previous value minus the subtracted value `v`."
        , description: `Subtract a value from the current value, depending on ${doc_link('use', "`use`")}`
        , examples: [
            "shape(3).scrollY(-0.2).rotate(L.time().mod(10).sub(5).floor().rad(1/10)).out(o0)"
        ]
    })
    , fun: (args) => {
        const {v: value} = expand_args({v: 0}, args);

        return (input, gen_args, run_args) => {
            const vv = freeze_values(value, run_args, gen_args);
            return undefault(input, 0) - vv;
        };
    }};

    _functions.floor = {doc: ({doc_link}) => ({
        title: "Round down to the nearest number of digits"
        , command: ["floor(d)", "floor({d})"]
        , params: {
            d: `The number of digits after the decimal point to round down to.
    Default is 0 which is effectively the nearest lower integer.`
        }
        , return: "Rounded value"
        , description: `Rounds the current value down to the specified number of decimal places. This can
    be used to discretize continous valued functions.`
        , examples: [
            "shape(3).scrollY(L.range({u:10,s:0.5}).floor(1)).out(o0)"
        ]
    })
    , fun: (args) => {
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

    _functions.rad = {fun: (args) => {
        const {s: scale, o: offset} = expand_args({s: 1, o: 0}, args);

        return (input, gen_args, run_args) => {
            const [sv, ov] = freeze_values([scale, offset], run_args, gen_args);
            
            const rv = undefault(input, 0);
            
            return (rv + ov) * sv * TAU;
        };

    }};

    return _functions;
};

const functions = ({logger = console.log}) => ({
    __category: "maths"
    , __doc: {
        title: "Math related functions"
        , description: `Various generally maths related functions that act on
Hydra LFO values.`
    }
    , ...(make_functions({logger}))
});

/* Copyright (C) 2019  oscons (github.com/oscons). All rights reserved.
 * Licensed under the GNU General Public License, Version 2.0.
 * See LICENSE file for more information */

const TAU$1 = 2 * Math.PI;

const make_functions$1 = ({logger = console.log}) => {
    const _functions = {};

    // TODO: use LUTs
    _functions.sin = {fun: (args) => {
        const {f: frequency, s: scale, o: offset} = expand_args({f: 1, s: 1, o: 0}, args);

        return (input, gen_args, run_args) => {
            const [fv, sv, ov] = freeze_values([frequency, scale, offset], run_args, gen_args);
            let time = 0;

            time = undefault(input, get_time(gen_args, run_args, true));
            time = undefault(time, 0.25);

            return (((Math.sin(time * TAU$1 * fv) / 2) + 0.5) * sv) + ov;
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

const functions$1 = ({logger = console.log}) => ({
    __category: "generator"
    , __doc: {
        title: "Generator functions"
        , description: `Functions that generate values and can be used as the
the source for other functions and parameters.`
    }
    , ...(make_functions$1({logger}))
});

/* Copyright (C) 2019  oscons (github.com/oscons). All rights reserved.
 * Licensed under the GNU General Public License, Version 2.0.
 * See LICENSE file for more information */

const make_functions$2 = ({logger = console.log}) => {
    const _functions = {};

    _functions.speed = {fun: (args) => {
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

            gen_args.scale_time(time_scale);

            return input;
        };
    }};

    _functions.fast = {fun: (args) => {
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

            gen_args.scale_time(time_scale, (v) => ((time_scale * v) + ov));
            
            return input;
        };
    }};

    _functions.slow = {fun: (args) => {
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
            if (time_scale === 0) {
                time_scale = 1;
            }

            gen_args.scale_time(time_scale, (v) => ((v / time_scale) + ov));
            
            return input;
        };
    }};

    _functions.time = {fun: (args) => {
        const {s: scale, o: offset} = expand_args({s: 1, o: 0}, args);

        return (input, gen_args, run_args) => {
            const [sv, ov] = freeze_values([scale, offset], run_args, gen_args);

            return (get_time(gen_args, run_args) * sv) + ov;
        };
    }};
    
    return _functions;
};

const functions$2 = ({logger = console.log}) => ({
    __category: "time"
    , __doc: {
        title: "Time functions"
        , description: `Functions that affect the time such as slowing it down
or speeding it up`
    }
    , ...(make_functions$2({logger}))
});

/* Copyright (C) 2019  oscons (github.com/oscons). All rights reserved.
 * Licensed under the GNU General Public License, Version 2.0.
 * See LICENSE file for more information */

const make_functions$3 = ({logger = console.log}) => {
    const _functions = {};

    _functions.set =
        {doc: {
            title: "Set a value"
            , command: [
                'set(v, t)', 'set({v, t})'
            ]
            , params: {
                v: `The value to set. This can either be a scalar value or a
    function that returns a scalar value.`
            }
            , return: "The set value"
            , description: `Set the `
            , see_also: ['use', 'time']
            , examples: [
                'Shape(L.set(5))'
                , 'Shape(L.set(({time}) => time % 5))'
                , 'Shape(L.set(({time}) => time + 5).)'
            ]
        }
        , fun: (args) => {
            let avalue = 0;
            let tgt_value = ud;
            
            if (typeof args !== 'undefined') {
                if (Array.isArray(args)) {
                    if (args.length > 0) {
                        const [first_arg, second_arg] = args;
                        if (typeof first_arg === 'object') {
                            if (Array.isArray(first_arg)) {
                                avalue = 0;
                            } else if ('v' in first_arg) {
                                avalue = first_arg.v;
                            } else {
                                avalue = 0;
                            }
                        } else {
                            avalue = first_arg;
                        }
                        if (typeof second_arg === 'string') {
                            tgt_value = second_arg;
                        }
                    }
                } else if (typeof args !== 'object') {
                    avalue = args;
                }
            }

            if (typeof args !== 'undefined' && args.length > 0
                && (typeof args[0] !== 'object'
                    || Array.isArray(args[0])
                    || 'v' in Object.keys(args[0])
                )) {
                const {v} = expand_args({v: ud}, args);
                avalue = v;
            }
            const value = avalue;

            return (input, gen_args, run_args) => {
                const vv = freeze_values(value, run_args, gen_args);
                
                if (typeof tgt_value !== 'undefined') {
                    gen_args.values[tgt_value] = vv;

                    if (tgt_value !== gen_args.current_value) {
                        return input;
                    }
                }

                return vv;
            };
        }};

    _functions.use =
        {doc: {
            title: "Set the currently modified value."
            , command: [
                "use(n, c)", "use({n, c})"
            ]
            , params: {
                n: `The name of the value. The default value is \`val\`. You can
    manipulate \`time\` or \`bpm\` or any other string value as well.`
                , c: `Should the currently in use value be copied over to the new on
    one. Either \`true\` to copy or \`false\` to keep the value untouched. Defaul
    is \`false\``
            }
            , return: "The currently in use value."
            , description: `You can manipulate a custom list of values which
    you can refer to by name. The \`val\` value is the default used initially.
    The last value that's in \`use\` will be what the LFO function finally returns.

    Though \`fast\` and
    the likes are the preferred way to manipulate time you can also use
    \`use('time')\` to manipulate time directly or return its value from the LFO 
    function.`
            , examples: [
                "shape(L.set(10).use('time').mul(2).use('val')).out(o0)"
                , "shape(10, L.use('time').add(1).use('val').sin().add(1)).out(o0)"
            ]
        }
        , fun: (args) => {
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
        }};

    _functions.get =
        {doc: {
            title: "Set the current value to a named one."
            , command: [
                "get(n)", "get({n})"
            ]
            , params: {
                n: "The name of the value to get, e.g. `time` to get the current time. Default value is `val`"
            }
            , return: "The value saved unter the name specified by `n`. Can be undefined."
            , description: `Fetches the value stored with the name \`n\` and sets it as the current value.`
            , examples: [
                "shape(3, L.get('time').mul(2).use('time', true).sin(1, 0.5, 0.5)).out(o0)"
            ]
        }
        , fun: (args) => {
            const {n: name} = expand_args({n: "val"}, args);

            return (input, gen_args, run_args) => {
                const [nv] = freeze_values([name], run_args, gen_args);

                const ret = gen_args.values[nv];
                
                gen_args.current_value = ret;

                return ret;
            };
        }};

    _functions.used =
        {doc: {
            title: "Return the name of the currently in `use` value"
            , command: [
                "used()"
            ]
            , params: {
            }
            , return: "The name set by the last `use` command or `val` if not set at all."
            , description: `This function allows you to retrieve the name of the
    current default parameter that is modufied by functions like \`mul\` or \`set\`.

    This is usually most helpful for debugging purposes, though you could use it in
    \`map\` too.`
            , examples: [
                "console.log(L.used()) // == 'val'"
                , "console.log(L.use('time').used()) == 'time'"
                , `
    shape(3)
        .rotate(
            L.use(() => (time % 2 < 1 ? "cos" : "sin"))
                .used()
                .map((x, _, {time}) => eval(\`Math.$\{x}(time)\`))
                .mul(2)
        ).out(o0)

    `
            ]
        }
        , fun: () => ((_, gen_args) => gen_args.current_value)};

    _functions.noop =
        {doc: {
            title: "Do nothing"
            , command: ["noop()"]
            , params: {
            }
            , return: "The unmodified input value."
            , description: `This function performs no operation. It's mostly used
    for debugging and testing purposes`
            , examples: [
                "L.noop().gen()({val: 2}) // == 2"
                , "L.time().noop().run({time: 2}) // == 2"
            ]
        }
        , fun: () => ((input) => input)};

    _functions.stop = {fun: (args) => {
        const {v: value} = expand_args({v: ud}, args);

        const fi = function (input, gen_args, run_args) {
            const vv = freeze_values(value, run_args, gen_args);

            return undefault(vv, undefault(input, get_time(gen_args, run_args)));
        };
        fi.stop = true;
        return fi;
    }};
    
    return _functions;
};

const functions$3 = ({logger = console.log}) => ({
    __category: "general"
    , __doc: {
        title: "General Hydra LFO utility functions"
        , description: `Functions that perform various tasks on Hydra LFO
values or its processing chain.`
    }
    , ...(make_functions$3({logger}))
});

/* Copyright (C) 2019  oscons (github.com/oscons). All rights reserved.
 * Licensed under the GNU General Public License, Version 2.0.
 * See LICENSE file for more information */

const make_functions$4 = ({logger = console.log}) => {
    const _functions = {};

    // TODO: this should be locked to time/BPM boundaries
    _functions.sah = {fun: (args) => {
        const {h: hold_time} = expand_args({h: 1}, args);

        return (input, gen_args, run_args) => {
            const hv = freeze_values(hold_time, run_args, gen_args);

            let prev_time = Number.MIN_SAFE_INTEGER;
            if (typeof gen_args.private_state.time !== 'undefined') {
                prev_time = gen_args.private_state.time;
            }
            if (typeof gen_args.private_state.value === 'undefined') {
                gen_args.private_state.value = input;
            }

            if ((gen_args.values.time - prev_time) >= Math.abs(hv)) {
                gen_args.private_state.value = input;
                gen_args.private_state.time = gen_args.values.time;
            }
            
            return gen_args.private_state.value;
        };
    }};

    const DEFAULT_SLEW_TYPE = 'h';
    const SLEW_TYPES = {
        // hard limit slew
        h: (curr, tgt, tdiff, max_rate) => {
            const curr_rate = (tgt - curr) / tdiff;
            if (Math.abs(curr_rate) <= max_rate) {
                return tgt;
            }
            return curr + (max_rate * tdiff * Math.sign(curr_rate));
        }
    };

    _functions.slew = {fun: (args) => {
        const {r: rate, t: type, i: ival} = expand_args({r: 0.5, t: DEFAULT_SLEW_TYPE, i: 1}, args);

        return (input, gen_args, run_args) => {
            const [rv, iv, tv] = freeze_values([rate, ival, type], run_args, gen_args);

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
            const max_rate = rv / iv;
            
            gen_args.private_state.time = time;
            gen_args.private_state.tgt = tgt;

            gen_args.private_state.prev = SLEW_TYPES[tv](gen_args.private_state.prev, tgt, tdiff, max_rate);

            return gen_args.private_state.prev;
        };
    }};

    _functions.map = {fun: (args) => {
        const {f: func} = expand_args({f: (x) => x}, args);

        return (value, gen_args, run_args) => func(value, gen_args, ...run_args);
    }};

    _functions.clip = {doc: {
        title: "Clip a value between two thresholds"
        , command: [
            "clip(u, l, s)", "clip({u, l, s})"
        ]
        , params: {
            u: "Upper bound. Default is 1"
            , l: "Lower bound. Default is 0"
            , s: "Scale to apply to inpcoming value *before* clipping. Default is 1"
            , o: "Offset to add *after* clipping. Default is 0"
        }
        , return: "A value in the range of `[l, u] + o`."
        , description: `Allows you to ensure the values are within an aceptable
    range for the following operations.`
        , examples: [`shape(3).rotate(
        L.set(L.time(), 'init')
            .use('init')
            .map((x, {time}) => time - x)
            .clip(10)
            .map((x) => (10 - x)/10)
            .rad()
    ).out(o0);`
        ]
    }
    , fun: (args) => {
        const {u: upper, l: lower, s: scale, o: offset} = expand_args({u: 1, l: 0, s: 1, o: 0}, args);

        return (input, gen_args, run_args) => {
            const [uv, lv, sv, ov] = freeze_values([upper, lower, scale, offset], run_args, gen_args);

            const v = undefault(input, 0) * sv;
            
            return (v > uv ? uv : (v < lv ? lv : v)) + ov;
        };
    }};
    return _functions;
};

const functions$4 = ({logger = console.log}) => ({
    __category: "modifiers"
    , __doc: {
        title: "Modifier functions"
        , description: `Functions that modify Hydra LFO values in some way or
another.`
    }
    , ...(make_functions$4({logger}))
});

/* Copyright (C) 2019  oscons (github.com/oscons). All rights reserved.
 * Licensed under the GNU General Public License, Version 2.0.
 * See LICENSE file for more information */

const make_functions$5 = ({logger = console.log}) => {
    const _functions = {};

    _functions.async = {
        doc: {
            title: "Asynchronously execute a function"
            , command: [
                'async(f, r, d)'
                , 'async({f, r, d})'
            ]
            , params: {
                f: "Function to execute. Default is `() => {}`"
                , r: `Run frequency of the function. A value of \`0\` or less will
    result in the function being called only once. Default is \`1\``
                , d: "Delay before first run. Default is `0`"
            }
            , return: "The unaltered input value."
            , description: `The provided function is run with a frequency of \`r\`
    per time unit. All parameters are based on the current \`time\` and \`bpm\`,
    assuming \`time\` is in beats. Timing is not guaranteed, so \`f\` might drift
    over time.

    Internally async is implemented using setTimeout with all implications regarding
    execution context.`
            , examples: [`const x = {v: 3};
    shape(
        L.async(() => x.v = ((x.v + 1 ) % 5) + 3)
            .set(() => x.v)
    ).out(o0);`
            ]
        }
        , fun: (args) => {
            const {f: fn, r: run_freq, d: delay} = expand_args({f: ud, r: 1, d: 0}, args);

            const thread_state = {
                id: uuid()
                , do_stop: false
                , running: false
                , last_args: [ud, ud, ud]
            };

            return (input, gen_args, run_args) => {
                thread_state.last_args = [input, gen_args, run_args];

                if (typeof fn === 'undefined') {
                    return input;
                }

                // luckyily javascript is single threaded...
                let asyncs = gen_args.global_state.async;
                if (typeof asyncs !== 'undefined') {
                    return input;
                }

                gen_args.global_state.async = {};
                asyncs = gen_args.global_state.async;

                if (typeof asyncs[thread_state.id] !== 'undefined') {
                    return input;
                }

                gen_args.global_state.cleanup.push(() => {
                    thread_state.do_stop = true;
                    thread_state.last_args = [ud, ud, ud];
                });

                asyncs[thread_state.id] = {
                    init: gen_args.values.time
                    , state: thread_state
                };

                const bpm = get_bpm(gen_args, run_args, false);
                const beats_to_millis = (n) => Math.max((60 / bpm) / n * 1000, 100);
                const timeout = run_freq <= 0 ? -1 : beats_to_millis(run_freq);
                const delayt = beats_to_millis(delay);
                const env = get_global_env();
                const tfunc = () => {
                    if (thread_state.do_stop) {
                        return;
                    }
                    logger("async", {args: thread_state.last_args});
                    const ret = fn(...thread_state.last_args);
                    if (!ret) {
                        return;
                    }
                    if (timeout > 0) {
                        env.setTimeout(tfunc, timeout);
                    }
                };

                logger(`starting thread ${thread_state.id}, delayt=${delayt} timeout=${timeout}`);
                if (typeof env !== 'undefined') {
                    if (delay <= 0) {
                        thread_state.running = true;
                        thread_state.do_stop = false;
                        tfunc();
                    } else {
                        env.setTimeout(() => {
                            thread_state.running = true;
                            thread_state.do_stop = false;
                            tfunc();
                        }, delayt);
                    }
                }
                
                return input;
            };
        }
    };
    return _functions;
};

const functions$5 = ({logger = console.log}) => ({
    __category: "async"
    , __doc: {
        title: "Asynchronous functions"
        , description: `Functions allowing you to perform actions asynchronously
to the main processing done in Hydra.`
    }
    , ...(make_functions$5({logger}))
});

/* Copyright (C) 2019  oscons (github.com/oscons). All rights reserved.
 * Licensed under the GNU General Public License, Version 2.0.
 * See LICENSE file for more information */

const builtin_functions = (options) => [
    functions
    , functions$1
    , functions$2
    , functions$3
    , functions$4
    , functions$5
].reduce((prev, ob) => {
    const obi = ob(options);
    let category_name = "other";
    if ('__category' in obi) {
        category_name = ob.__category;
    }
    const category = prev.doc[category_name] ? prev.doc[category_name] : {};

    if ('__doc' in ob) {
        category.__doc = ob.__doc;
    }

    Object.entries(obi)
        .filter(([name]) => name.indexOf("__") !== 0)
        .forEach(([name, value]) => {
            const {fun, doc} = value;
            category[name] = doc;
            prev.fn[name] = fun;
        });
    return prev;
}, {doc: {}, fn: {}});

const DOCUMENTATION = builtin_functions({logger: () => ud}).doc;

const get_doc = () => DOCUMENTATION;

const run_calls = (options, global_state, instance_state, calls, args) => {

    const run_options = {...{return_undef: false}, ...options};

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
        , time_unit: 'b'
        , global_state
        , instance_state
        , private_state: {}
    };

    gen_args.set_time = (t) => {
        if (gen_args.time_unit === 'b') {
            gen_args.values.beats = t;
            gen_args.values.time = gen_args.values.beats;
            gen_args.values.clock_time = beats_to_time(t, gen_args.values.bpm);
        } else {
            gen_args.values.clock_time = t;
            gen_args.values.time = gen_args.values.clock_time;
            gen_args.values.beats = time_to_beats(t, gen_args.values.bpm);
        }
    };

    gen_args.scale_time = (s, fn) => {
        let fnx = fn;
        if (typeof fnx !== 'function') {
            fnx = (x) => x * s;
        }
        // logger({fn, tfnx: (typeof fnx), fnx});

        gen_args.set_time(fnx(gen_args.values.time));
    };

    gen_args.values.initial_time = get_time(gen_args.values, run_args);
    gen_args.values.clock_time = gen_args.values.initial_time;
    gen_args.values.bpm = get_bpm(gen_args.values, gen_args.values);

    if (gen_args.time_unit === 'b') {
        gen_args.values.time = time_to_beats(gen_args.values.clock_time, gen_args.values.bpm);
    } else {
        gen_args.values.time = gen_args.values.clock_time;
    }

    run_args[0] = gen_args.values;

    let stop_it = false;
    calls.forEach(([fncall, private_state]) => {
        if (stop_it) {
            return;
        }
        gen_args.private_state = private_state;
        gen_args.input = gen_args.values[gen_args.current_value];

        const res = fncall(gen_args.input, gen_args, run_args);
        gen_args.values[gen_args.current_value] = res;

        if (fncall.stop) {
            stop_it = true;
        }
    });
    
    const rval = gen_args.values[gen_args.current_value];
    if (typeof rval === 'undefined' && !run_options.return_undef) {
        return undefault(gen_args.values.time, 0);
    }

    return rval;
};

const sub_call = (call_options, global_state, prev_calls, fun) => {
    const {functions} = call_options;
    const calls = prev_calls.map((x) => [x, {}]);
    const instance_state = {};

    if (typeof fun !== 'undefined') {
        calls.push([fun, {}]);
    }

    const option_call = (options, args) => run_calls(options, global_state, instance_state, calls, args);

    const run_function = (...args) => option_call({}, args);
    run_function.run = run_function;
    run_function.gen = (options) => (...args) => option_call(options, args);
    run_function[CANARY] = true;

    Object.entries(functions).forEach(([name, gen]) => {
        if (name in run_function && !(name in Object.getOwnPropertyNames())) {
            throw new Error(`${name} already exists on parents of run_function`);
        }
        if (typeof gen === 'undefined') {
            throw new Error(`undefined generator ${name}`);
        }
        run_function[name] = (...args) => sub_call(
            call_options
            , global_state
            , calls.map(([call]) => call)
            , gen(args)
        );
    });

    return run_function;
};

const make_new_lfo = ({state, logger}) => {
    const fdef = {};
    const global_state = undefault(state, {});
    
    global_state.cleanup = [];

    const functions = builtin_functions({logger}).fn;

    Object.keys(functions).forEach((name) => {
        fdef[name] = (...args) => sub_call({functions}, global_state, [])[name](...args);
    });

    fdef.__release = (new_lfo) => {
        global_state.cleanup.forEach((cfn) => {
            cfn(global_state, new_lfo);
        });
    };

    return fdef;
};

const GLOBAL_INIT_ID = "__hydralfo_global";

const init = (args) => {
    const {state = ud
        , init_global = true
        , force = false
        , logger = console.log} = undefault(args, {});
    const new_lfo = make_new_lfo({state, logger});

    if (!init_global) {
        return new_lfo;
    }

    const env = get_global_env();

    if (typeof env !== 'undefined') {
        if (GLOBAL_INIT_ID in env) {
            const old_lfo = env[GLOBAL_INIT_ID];
            if (typeof old_lfo === 'object') {
                if ('__release' in old_lfo) {
                    old_lfo.__release(new_lfo);
                }
                if (!force) {
                    return old_lfo;
                }
            }
        }
        env[GLOBAL_INIT_ID] = new_lfo;
    }

    return new_lfo;
};

var hydralfo = {
    init
    , get_doc
};

exports.default = hydralfo;
exports.get_doc = get_doc;
exports.init = init;
