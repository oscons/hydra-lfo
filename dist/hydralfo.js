(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.hydralfo = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.functions = void 0;

var _util = require("./util");

const _functions = {};
_functions.set = {
  doc: ``,
  fun: args => {
    const {
      v: value
    } = (0, _util.expand_args)({
      v: 0
    }, args);
    return (input, gen_args, run_args) => {
      const vv = (0, _util.freeze_values)(value, run_args, gen_args);
      return vv;
    };
  }
};
_functions.use = {
  fun: args => {
    const {
      n: name,
      c: copy
    } = (0, _util.expand_args)({
      n: "val",
      c: false
    }, args);
    return (input, gen_args, run_args) => {
      const [nv, cv] = (0, _util.freeze_values)([name, copy], run_args, gen_args);
      let ret = gen_args.values[nv];

      if (cv) {
        ret = input;
      }

      gen_args.current_value = nv;
      return ret;
    };
  }
};
_functions.used = {
  fun: () => (_, gen_args) => gen_args.current_value
};
_functions.noop = {
  fun: () => input => input
};
const functions = _functions;
exports.functions = functions;

},{"./util":6}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.functions = void 0;

var _util = require("./util");

const _functions = {};
const TAU = 2 * Math.PI;
_functions.sin = {
  fun: args => {
    const {
      f: frequency,
      s: scale,
      o: offset
    } = (0, _util.expand_args)({
      f: 1,
      s: 1,
      o: 0
    }, args);
    return (input, gen_args, run_args) => {
      const [fv, sv, ov] = (0, _util.freeze_values)([frequency, scale, offset], run_args, gen_args);
      let time = 0;

      if (typeof input === 'undefined') {
        time = (0, _util.get_time)(gen_args, run_args);
      } else {
        time = input;
      }

      time = (0, _util.undefault)(time, Math.PI);
      return (Math.sin(time * TAU * fv) / 2 + 0.5) * sv + ov;
    };
  }
};
_functions.rnd = {
  fun: args => {
    const {
      s: scale,
      o: offset,
      m: mix
    } = (0, _util.expand_args)({
      s: _util.ud,
      o: 0,
      m: 0
    }, args);
    return (input, gen_args, run_args) => {
      const [sv, ov, mv] = (0, _util.freeze_values)([scale, offset, mix], run_args, gen_args);
      let svx = 1;

      if (typeof input === 'undefined') {
        if (typeof sv !== 'undefined') {
          svx = sv;
        }
      } else if (typeof sv === 'undefined') {
        svx = input;
      } else {
        svx = (0, _util.mix_values)(svx, input, mv);
      }

      return Math.random() * svx + ov;
    };
  }
};
_functions.rand = _functions.rnd;
_functions.range = {
  fun: args => {
    const {
      u: upper,
      l: lower,
      s: step
    } = (0, _util.expand_args)({
      u: 10,
      l: 0,
      s: 1
    }, args);
    return (input, gen_args, run_args) => {
      const [sv, uv, lv] = (0, _util.freeze_values)([step, upper, lower], run_args, gen_args);
      let npi = 0;

      if (gen_args.private_state.prev) {
        const {
          spi = 0
        } = gen_args.private_state.prev;
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

      gen_args.private_state.prev = {
        spi: npi
      };
      return npi;
    };
  }
};
_functions.iter = {
  fun: args => {
    const {
      v: values,
      s: step
    } = (0, _util.expand_args)({
      v: [0, 1],
      s: 1
    }, args);
    return (input, gen_args, run_args) => {
      const [vv, sv] = (0, _util.freeze_values)([values, step], run_args, gen_args);
      let {
        pi = 0
      } = gen_args.private_state.prev ? gen_args.private_state.prev : {};

      if (gen_args.private_state.prev) {
        pi = sv + pi + (0, _util.undefault)(input, 0);
      }

      gen_args.private_state.prev = {
        pi
      };
      const vs = vv;
      let idx = Math.floor(pi);
      idx = idx % vs.length;
      const val = vs[idx];

      if (typeof val === 'function') {
        return val(input, gen_args, run_args);
      }

      return val;
    };
  }
};
_functions.choose = {
  fun: args => {
    const {
      v: values,
      s: scale
    } = (0, _util.expand_args)({
      v: [0, 1],
      s: 1
    }, args);
    return (input, gen_args, run_args) => {
      const [vv, sv] = (0, _util.freeze_values)([values, scale], run_args, gen_args);

      if (vv.length === 0) {
        return 0;
      }

      let idx = (0, _util.undefault)(input, 0);
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

        if (maxcnt-- <= 0 || typeof val === 'function' && val.__choose_mark === fmark) {
          // loop detected
          val = 0;
          break;
        }

        delete fn.__choose_mark;
      }

      return val;
    };
  }
};
const functions = _functions;
exports.functions = functions;

},{"./util":6}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.functions = void 0;

var _util = require("./util");

const _functions = {};
_functions.add = {
  fun: args => {
    const {
      v: value
    } = (0, _util.expand_args)({
      v: 0
    }, args);
    return (input, gen_args, run_args) => {
      const vv = (0, _util.freeze_values)(value, run_args, gen_args);
      return (0, _util.undefault)(input, 0) + vv;
    };
  }
};
_functions.sub = {
  fun: args => {
    const {
      v: value
    } = (0, _util.expand_args)({
      v: 0
    }, args);
    return (input, gen_args, run_args) => {
      const vv = (0, _util.freeze_values)(value, run_args, gen_args);
      return (0, _util.undefault)(input, 0) + vv;
    };
  }
};
_functions.floor = {
  fun: args => {
    const {
      d: digits
    } = (0, _util.expand_args)({
      d: 0
    }, args);
    return (input, gen_args, run_args) => {
      const dv = (0, _util.freeze_values)(digits, run_args, gen_args);
      const fact = Math.pow(10, dv);
      return Math.floor(input * fact) / fact;
    };
  }
};
_functions.mul = {
  fun: args => {
    const {
      v: value
    } = (0, _util.expand_args)({
      v: 0
    }, args);
    return (input, gen_args, run_args) => {
      const vv = (0, _util.freeze_values)(value, run_args, gen_args);
      return input * vv;
    };
  }
};
_functions.div = {
  fun: args => {
    const {
      v: value
    } = (0, _util.expand_args)({
      v: 1
    }, args);
    return (input, gen_args, run_args) => {
      const vv = (0, _util.freeze_values)(value, run_args, gen_args);
      const definput = (0, _util.undefault)(input, 0);

      if (vv === 0) {
        return definput / 0.0000000000001;
      }

      return definput / vv;
    };
  }
};
_functions.mod = {
  fun: args => {
    const {
      v: value
    } = (0, _util.expand_args)({
      v: 1
    }, args);
    return (input, gen_args, run_args) => {
      const vv = (0, _util.freeze_values)(value, run_args, gen_args);

      if (vv === 0) {
        return 0;
      }

      return (0, _util.undefault)(input, 0) % vv;
    };
  }
};
const functions = _functions;
exports.functions = functions;

},{"./util":6}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.functions = void 0;

var _util = require("./util");

const _functions = {};
_functions.sah = {
  fun: args => {
    const {
      h: hold_time
    } = (0, _util.expand_args)({
      h: 1
    }, args);
    return (input, gen_args, run_args) => {
      const [hv] = (0, _util.freeze_values)([hold_time], run_args, gen_args);
      let prev_time = 0;

      if (typeof gen_args.private_state.time !== 'undefined') {
        prev_time = gen_args.private_state.time;
      }

      if (typeof gen_args.private_state.value === 'undefined') {
        gen_args.private_state.value = input;
      }

      if (gen_args.values.time - prev_time >= hv) {
        gen_args.private_state.value = input;
        gen_args.private_state.time = gen_args.values.time;
      }

      return gen_args.private_state.value;
    };
  }
};
const DEFAULT_SLEW_TYPE = 'h';
const SLEW_TYPES = {
  h: (x, over) => x - over
};
_functions.slew = {
  fun: args => {
    const {
      r: rate,
      t: type,
      i: ival
    } = (0, _util.expand_args)({
      r: 0.5,
      t: DEFAULT_SLEW_TYPE,
      i: 1
    }, args);
    return (input, gen_args, run_args) => {
      const [rv, iv] = (0, _util.freeze_values)([rate, ival], run_args, gen_args);

      if (typeof gen_args.private_state.time === 'undefined') {
        gen_args.private_state.time = (0, _util.get_time)(gen_args, run_args);
        gen_args.private_state.prev = input;
        gen_args.private_state.tgt = input;
        return input;
      }

      const tgt = (0, _util.undefault)(input, gen_args.private_state.tgt);

      if (typeof tgt === 'undefined') {
        return _util.ud;
      }

      if (typeof gen_args.private_state.prev === 'undefined') {
        gen_args.private_state.prev = tgt;
      }

      const time = (0, _util.get_time)(gen_args, run_args);
      const tdiff = time - gen_args.private_state.time;
      const vdiff = tgt - gen_args.private_state.prev;
      gen_args.private_state.time = time;
      gen_args.private_state.tgt = tgt;
      const over = vdiff - tdiff / iv * rv;
      let nv = tgt;

      if (over > 0) {
        let tv = (0, _util.freeze_values)(type, run_args, gen_args);

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
  }
};
_functions.map = {
  fun: args => {
    const {
      f: func
    } = (0, _util.expand_args)({
      f: x => x
    }, args);
    return (value, gen_args, run_args) => func(value, gen_args, ...run_args);
  }
};
const functions = _functions;
exports.functions = functions;

},{"./util":6}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.functions = void 0;

var _util = require("./util");

const _functions = {};
_functions.speed = {
  fun: args => {
    const {
      v: value,
      m: mix
    } = (0, _util.expand_args)({
      v: _util.ud,
      m: _util.ud
    }, args);
    return (input, gen_args, run_args) => {
      const [vv, mv] = (0, _util.freeze_values)([value, mix], run_args, gen_args);
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
        time_scale = (0, _util.mix_values)(vv, input, mv);
      }

      gen_args.values.time = time_scale * gen_args.values.time;
      return input;
    };
  }
};
_functions.fast = {
  fun: args => {
    const {
      s: scale,
      o: offset,
      m: mix
    } = (0, _util.expand_args)({
      s: _util.ud,
      o: 0,
      m: 0
    }, args);
    return (input, gen_args, run_args) => {
      const [sv, ov, mv] = (0, _util.freeze_values)([scale, offset, mix], run_args, gen_args);
      let time_scale = 1;

      if (typeof input === 'undefined') {
        if (typeof sv !== 'undefined') {
          time_scale = sv;
        }
      } else if (typeof sv === 'undefined') {
        time_scale = input;
      } else {
        time_scale = (0, _util.mix_values)(sv, input, mv);
      }

      gen_args.values.time = time_scale * gen_args.values.time + ov;
      return input;
    };
  }
};
_functions.time = {
  fun: args => {
    const {
      s: scale,
      o: offset
    } = (0, _util.expand_args)({
      s: 1,
      o: 0
    }, args);
    return (input, gen_args, run_args) => {
      const [sv, ov] = (0, _util.freeze_values)([scale, offset], run_args, gen_args);
      return (0, _util.get_time)(gen_args, run_args) * sv + ov;
    };
  }
};
_functions.beats = {
  fun: args => {
    const {
      s: scale,
      b: sbpm
    } = (0, _util.expand_args)({
      s: 1,
      b: _util.ud
    }, args);
    return (input, gen_args, run_args) => {
      const [sv, bv] = (0, _util.freeze_values)([scale, sbpm], run_args, gen_args);
      const {
        time,
        bpm
      } = run_args;
      let abpm = bv;

      if (typeof abpm === 'undefined') {
        abpm = bpm;
      }

      gen_args.values.time = (0, _util.undefault)(time, 0) / 60 * abpm * sv;
      return input;
    };
  }
};
_functions.sec = {
  fun: args => {
    const {
      s: scale,
      b: sbpm
    } = (0, _util.expand_args)({
      s: 1,
      b: _util.ud
    }, args);
    return (input, gen_args, run_args) => {
      const [sv, bv] = (0, _util.freeze_values)([scale, sbpm], run_args, gen_args);
      const time = (0, _util.get_time)(gen_args, run_args);
      const bpm = (0, _util.get_bpm)(gen_args, run_args);
      let abpm = bv;

      if (typeof abpm === 'undefined') {
        abpm = bpm;
      }

      gen_args.values.time = (0, _util.undefault)(time, 0) * 60 / abpm * sv;
      return input;
    };
  }
};
const functions = _functions;
exports.functions = functions;

},{"./util":6}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.freeze_values = exports.get_bpm = exports.get_time = exports.expand_args = exports.undefault = exports.mix_values = exports.CANARY = exports.ud = void 0;

// eslint-disable-next-line no-empty-function
const ud = function () {}();

exports.ud = ud;
const CANARY = "__hydralfo_func";
exports.CANARY = CANARY;

const mix_values = (a, b, m) => m === 0 ? a : m === 1 ? b : a * (1 - m) + b * m;

exports.mix_values = mix_values;

const undefault = (x, def) => typeof x === 'undefined' ? def : x;

exports.undefault = undefault;

const expand_args = (arg_def, args) => {
  const vals = { ...undefault(arg_def, {})
  };

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

  Object.keys(vals).forEach(x => {
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
          nargs.forEach(arg => {
            if (typeof arg === 'object') {
              if (Array.isArray(arg)) {
                new_call_args.push([...arg]);
              } else if ("call" in arg) {
                new_call_args.push(arg);
              } else {
                new_call_args.push({ ...arg
                });
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

exports.expand_args = expand_args;

const get_time = (gen_args, run_args, allow_undef = false) => {
  let namedargs = run_args;

  if (Array.isArray(namedargs) && namedargs.length > 0) {
    [namedargs] = namedargs;
  }

  if (typeof namedargs === 'object' && !Array.isArray(namedargs)) {
    const {
      time
    } = namedargs;

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

exports.get_time = get_time;

const get_bpm = (gen_args, run_args, allow_undef = false) => {
  let namedargs = run_args;

  if (Array.isArray(namedargs) && namedargs.length > 0) {
    [namedargs] = namedargs;
  }

  if (typeof namedargs === 'object' && !Array.isArray(namedargs)) {
    const {
      bpm
    } = namedargs;

    if (typeof bpm !== 'undefined') {
      return bpm;
    }
  }

  if (typeof gen_args !== 'undefined' && typeof gen_args.values !== 'undefined' && gen_args.values.bpm !== 'undefined') {
    return gen_args.values.bpm;
  }

  if (allow_undef) {
    return ud;
  }

  return 60;
};

exports.get_bpm = get_bpm;

const freeze_values = (v, args, gen_args) => {
  if (typeof v === 'undefined') {
    return v;
  }

  if (typeof v === 'function') {
    return v(...args, gen_args);
  }

  if (Array.isArray(v)) {
    return v.map(x => freeze_values(x, args, gen_args));
  }

  return v;
};

exports.freeze_values = freeze_values;

},{}],7:[function(require,module,exports){
(function (global){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.init = exports.get_doc = void 0;

var _util = require("./components/util");

var _maths = require("./components/maths");

var _generators = require("./components/generators");

var _time = require("./components/time");

var _general = require("./components/general");

var _modifiers = require("./components/modifiers");

const BUILTIN_FUNCTIONS = [_maths.functions, _generators.functions, _time.functions, _general.functions, _modifiers.functions].reduce((prev, ob) => {
  Object.entries(ob).forEach(([name, value]) => {
    prev[name] = value;
  });
  return prev;
}, {});

const extract_property = (arr, prop) => Object.entries(arr).map(([name, value]) => [name, value[prop]]).reduce((prev, [name, value]) => {
  prev[name] = value;
  return prev;
}, {});

const get_doc = () => Object.entries(extract_property(BUILTIN_FUNCTIONS, "doc")).filter(([, doc]) => typeof doc !== 'undefined').reduce((prev, [name, doc]) => {
  [prev[name]] = doc;
  return prev;
}, {});

exports.get_doc = get_doc;

const run_calls = (global_state, instance_state, calls, args) => {
  let run_args = args;

  if (typeof run_args === 'undefined' || run_args.length === 0) {
    run_args = [{}];
  }

  if (typeof run_args[0] === 'undefined') {
    run_args[0] = {};
  }

  const gen_args = {
    input: _util.ud,
    current_value: "val",
    values: {
      val: _util.ud,
      initial_args: args,
      ...run_args[0]
    },
    global_state,
    instance_state,
    private_state: {}
  };
  gen_args.values.initial_time = (0, _util.get_time)(gen_args.values, gen_args.values);
  gen_args.values.time = gen_args.values.initial_time;
  gen_args.values.val = gen_args.values.time;
  gen_args.values.get_bpm = (0, _util.get_bpm)(gen_args.values, gen_args.values);
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
  const calls = prev_calls.map(x => [x, {}]);
  const instance_state = {};

  if (typeof fun !== 'undefined') {
    calls.push([fun, {}]);
  }

  const rfun = (...args) => run_calls(global_state, instance_state, calls, args);

  rfun.run = rfun;

  rfun.gen = () => rfun;

  rfun[_util.CANARY] = true;
  Object.entries(extract_property(BUILTIN_FUNCTIONS, "fun")).forEach(([name, gen]) => {
    if (name in rfun && !(name in Object.getOwnPropertyNames())) {
      throw new Error(`${name} already exists on parents of rfun`);
    }

    rfun[name] = (...args) => sub_call(global_state, calls.map(([call]) => call), gen(args));
  });
  return rfun;
};

const get_global_env = () => {
  if (typeof window !== 'undefined') {
    return window;
  }

  return global;
};

const make_new_lfo = state => {
  const fdef = {};
  const global_state = typeof state === 'undefined' ? {} : state;
  const functions = extract_property(BUILTIN_FUNCTIONS, "fun");
  Object.keys(functions).forEach(name => {
    fdef[name] = (...args) => sub_call(global_state, [])[name](...args);
  });

  fdef.__release = new_lfo => {// for future use, e.g. to stop timeouts etc
  };

  return fdef;
};

const GLOBAL_INIT_ID = "__hydralfo_global";

const init = (state = _util.ud, init_global = true, force = false) => {
  const new_lfo = make_new_lfo(state);

  if (!init_global) {
    return new_lfo;
  }

  const env = get_global_env();

  if (typeof env !== 'undefined') {
    if (GLOBAL_INIT_ID in env) {
      const old_lfo = env[GLOBAL_INIT_ID];

      if (typeof old_lfo === 'object') {
        if (!force) {
          return env[GLOBAL_INIT_ID];
        }

        if ('__release' in old_lfo) {
          old_lfo.__release(new_lfo);
        }
      }
    }

    env[GLOBAL_INIT_ID] = new_lfo;
  }

  return new_lfo;
};

exports.init = init;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./components/general":1,"./components/generators":2,"./components/maths":3,"./components/modifiers":4,"./components/time":5,"./components/util":6}]},{},[7])(7)
});
//# sourceMappingURL=hydralfo.js.map
