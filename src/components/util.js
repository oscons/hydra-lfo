// eslint-disable-next-line no-empty-function
export const ud = ((function () {})());

export const CANARY = "__hydralfo_func";

export const mix_values = (a, b, m) => (m === 0 ? a : (m === 1 ? b : (a * (1 - m)) + (b * m)));

export const undefault = (x, def) => (typeof x === 'undefined' ? def : x);

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

export const get_time = (gen_args, run_args, allow_undef = false) => {
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

export const get_bpm = (gen_args, run_args, allow_undef = false) => {
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
