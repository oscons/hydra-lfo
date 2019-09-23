(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.hydralfo = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (global){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.init = void 0;

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// eslint-disable-next-line no-empty-function
var ud = function () {}();

var CANARY = "__hydralfo_func";

var mix_values = function mix_values(a, b, m) {
  return m === 0 ? a : m === 1 ? b : a * (1 - m) + b * m;
};

var undefault = function undefault(x, def) {
  if (typeof x === 'undefined') {
    return def;
  }

  return x;
};

var expand_args = function expand_args(arg_def, args) {
  var vals = _objectSpread({}, undefault(arg_def, {}));

  if (typeof args !== 'undefined' && args.length > 0) {
    var _args = _slicedToArray(args, 1),
        first = _args[0];

    if (_typeof(first) === 'object' && !Array.isArray(first)) {
      for (var x in arg_def) {
        if (x in first) {
          vals[x] = first[x];
        }
      }
    } else {
      var defkeys = Object.keys(arg_def);
      defkeys = defkeys.slice(0, Math.min(defkeys.length, args.length));
      defkeys.forEach(function (k, i) {
        vals[k] = args[i];
      });
    }
  }

  Object.keys(vals).forEach(function (x) {
    var vx = vals[x];
    var ax = arg_def[x];

    if (typeof vx === 'function') {
      vals[x] = function (input, call_gen_args, call_args) {
        var nargs = call_args;

        if (typeof nargs === 'undefined') {
          nargs = [{}];
        }

        if (CANARY in vx) {
          // make a 1 level copy of the call args for the call to the sub-chain
          var new_call_args = [];
          nargs.forEach(function (arg) {
            if (_typeof(arg) === 'object') {
              if (Array.isArray(arg)) {
                new_call_args.push(_toConsumableArray(arg));
              } else if ("call" in arg) {
                new_call_args.push(arg);
              } else {
                new_call_args.push(_objectSpread({}, arg));
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
      vals[x] = function () {
        return ax;
      };
    } else {
      vals[x] = function () {
        return vx;
      };
    }
  });
  return vals;
};

var get_time = function get_time(gen_args, run_args) {
  var allow_undef = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var time = ud;
  var namedargs = run_args;

  if (Array.isArray(namedargs) && namedargs.length > 0) {
    var _namedargs = namedargs;

    var _namedargs2 = _slicedToArray(_namedargs, 1);

    namedargs = _namedargs2[0];
  }

  if (_typeof(namedargs) === 'object' && !Array.isArray(namedargs)) {
    var atime = run_args.time;
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

var freeze_values = function freeze_values(v, args, gen_args) {
  if (typeof v === 'undefined') {
    return v;
  }

  if (typeof v === 'function') {
    return v.apply(void 0, _toConsumableArray(args).concat([gen_args]));
  }

  if (Array.isArray(v)) {
    return v.map(function (x) {
      return freeze_values(x, args, gen_args);
    });
  }

  return v;
};

var _functions = {};

_functions.add = function (args) {
  var _expand_args = expand_args({
    v: 0
  }, args),
      value = _expand_args.v;

  return function (input, gen_args, run_args) {
    var vv = freeze_values(value, run_args, gen_args);
    return undefault(input, 0) + vv;
  };
};

_functions.speed = function (args) {
  var _expand_args2 = expand_args({
    v: ud,
    m: ud
  }, args),
      value = _expand_args2.v,
      mix = _expand_args2.m;

  return function (input, gen_args, run_args) {
    var _freeze_values = freeze_values([value, mix], run_args, gen_args),
        _freeze_values2 = _slicedToArray(_freeze_values, 2),
        vv = _freeze_values2[0],
        mv = _freeze_values2[1];

    var time_scale = 1;

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

_functions.fast = function (args) {
  var _expand_args3 = expand_args({
    s: ud,
    o: 0,
    m: 0
  }, args),
      scale = _expand_args3.s,
      offset = _expand_args3.o,
      mix = _expand_args3.m;

  return function (input, gen_args, run_args) {
    var _freeze_values3 = freeze_values([scale, offset, mix], run_args, gen_args),
        _freeze_values4 = _slicedToArray(_freeze_values3, 3),
        sv = _freeze_values4[0],
        ov = _freeze_values4[1],
        mv = _freeze_values4[2];

    var time_scale = 1;

    if (typeof input === 'undefined') {
      if (typeof sv !== 'undefined') {
        time_scale = sv;
      }
    } else if (typeof sv === 'undefined') {
      time_scale = input;
    } else {
      time_scale = mix_values(sv, input, mv);
    }

    gen_args.values.time = time_scale * gen_args.values.time + ov;
    return input;
  };
};

_functions.time = function (args) {
  var _expand_args4 = expand_args({
    s: 1,
    o: 0
  }, args),
      scale = _expand_args4.s,
      offset = _expand_args4.o;

  return function (input, gen_args, run_args) {
    var _freeze_values5 = freeze_values([scale, offset], run_args, gen_args),
        _freeze_values6 = _slicedToArray(_freeze_values5, 2),
        sv = _freeze_values6[0],
        ov = _freeze_values6[1];

    return get_time(gen_args, run_args) * sv + ov;
  };
};

_functions.rnd = function (args) {
  var _expand_args5 = expand_args({
    s: ud,
    o: 0,
    m: 0
  }, args),
      scale = _expand_args5.s,
      offset = _expand_args5.o,
      mix = _expand_args5.m;

  return function (input, gen_args, run_args) {
    var _freeze_values7 = freeze_values([scale, offset, mix], run_args, gen_args),
        _freeze_values8 = _slicedToArray(_freeze_values7, 3),
        sv = _freeze_values8[0],
        ov = _freeze_values8[1],
        mv = _freeze_values8[2];

    var svx = 1;

    if (typeof input === 'undefined') {
      if (typeof sv !== 'undefined') {
        svx = sv;
      }
    } else if (typeof sv === 'undefined') {
      svx = input;
    } else {
      svx = mix_values(svx, input, mv);
    }

    return Math.random() * svx + ov;
  };
};

_functions.range = function (args) {
  var _expand_args6 = expand_args({
    u: 10,
    l: 0,
    s: 1
  }, args),
      upper = _expand_args6.u,
      lower = _expand_args6.l,
      step = _expand_args6.s;

  return function (input, gen_args, run_args) {
    var _freeze_values9 = freeze_values([step, upper, lower], run_args, gen_args),
        _freeze_values10 = _slicedToArray(_freeze_values9, 3),
        sv = _freeze_values10[0],
        uv = _freeze_values10[1],
        lv = _freeze_values10[2];

    var npi = 0;

    if (gen_args.private_state.prev) {
      var _gen_args$private_sta = gen_args.private_state.prev.spi,
          spi = _gen_args$private_sta === void 0 ? 0 : _gen_args$private_sta;
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
};

_functions.iter = function (args) {
  var _expand_args7 = expand_args({
    v: [0, 1],
    s: 1
  }, args),
      values = _expand_args7.v,
      step = _expand_args7.s;

  return function (input, gen_args, run_args) {
    var _freeze_values11 = freeze_values([values, step], run_args, gen_args),
        _freeze_values12 = _slicedToArray(_freeze_values11, 2),
        vv = _freeze_values12[0],
        sv = _freeze_values12[1];

    var _ref = gen_args.private_state.prev ? gen_args.private_state.prev : {},
        _ref$pi = _ref.pi,
        pi = _ref$pi === void 0 ? 0 : _ref$pi;

    if (gen_args.private_state.prev) {
      pi = sv + pi + undefault(input, 0);
    }

    gen_args.private_state.prev = {
      pi: pi
    };
    var vs = vv;
    var idx = Math.floor(pi);
    idx = idx % vs.length;
    var val = vs[idx];

    if (typeof val === 'function') {
      return val(input, gen_args, run_args);
    }

    return val;
  };
};

_functions.choose = function (args) {
  var _expand_args8 = expand_args({
    v: [0, 1],
    s: 1
  }, args),
      values = _expand_args8.v,
      scale = _expand_args8.s;

  return function (input, gen_args, run_args) {
    var _freeze_values13 = freeze_values([values, scale], run_args, gen_args),
        _freeze_values14 = _slicedToArray(_freeze_values13, 2),
        vv = _freeze_values14[0],
        sv = _freeze_values14[1];

    if (vv.length === 0) {
      return 0;
    }

    var idx = undefault(input, 0);
    idx = idx * sv;
    idx = Math.floor(Math.abs(idx));
    idx = idx % vv.length;
    var val = vv[idx];
    var fmark = "choose_mark_".concat(new Date().getTime());
    var maxcnt = 10;

    while (typeof val === 'function') {
      var fn = val;
      fn.__choose_mark = fmark;
      val = fn.apply(void 0, _toConsumableArray(run_args).concat([gen_args]));

      if (maxcnt-- <= 0 || typeof val === 'function' && val.__choose_mark === fmark) {
        // loop detected
        val = 0;
        break;
      }

      delete fn.__choose_mark;
    }

    return val;
  };
};

_functions.sin = function (args) {
  var _expand_args9 = expand_args({
    f: 1,
    s: 1,
    o: 0
  }, args),
      frequency = _expand_args9.f,
      scale = _expand_args9.s,
      offset = _expand_args9.o;

  return function (input, gen_args, run_args) {
    var _freeze_values15 = freeze_values([frequency, scale, offset], run_args, gen_args),
        _freeze_values16 = _slicedToArray(_freeze_values15, 3),
        fv = _freeze_values16[0],
        sv = _freeze_values16[1],
        ov = _freeze_values16[2];

    var time = 0;

    if (typeof input === 'undefined') {
      time = get_time(gen_args, run_args);
    } else {
      time = input;
    }

    time = undefault(time, Math.PI);
    return (Math.sin(time * 2 * Math.PI * fv) / 2 + 0.5) * sv + ov;
  };
};

_functions.floor = function (args) {
  var _expand_args10 = expand_args({
    d: 0
  }, args),
      digits = _expand_args10.d;

  return function (input, gen_args, run_args) {
    var dv = freeze_values(digits, run_args, gen_args);
    var fact = Math.pow(10, dv);
    return Math.floor(input * fact) / fact;
  };
};

_functions.set = function (args) {
  var _expand_args11 = expand_args({
    v: 0
  }, args),
      value = _expand_args11.v;

  return function (input, gen_args, run_args) {
    var vv = freeze_values(value, run_args, gen_args);
    return vv;
  };
};

_functions.mul = function (args) {
  var _expand_args12 = expand_args({
    v: 0
  }, args),
      value = _expand_args12.v;

  return function (input, gen_args, run_args) {
    var vv = freeze_values(value, run_args, gen_args);
    return input * vv;
  };
};

_functions.div = function (args) {
  var _expand_args13 = expand_args({
    v: 1
  }, args),
      value = _expand_args13.v;

  return function (input, gen_args, run_args) {
    var vv = freeze_values(value, run_args, gen_args);
    var definput = undefault(input, 0);

    if (vv === 0) {
      return definput / 0.0000000000001;
    }

    return definput / vv;
  };
};

_functions.mod = function (args) {
  var _expand_args14 = expand_args({
    v: 1
  }, args),
      value = _expand_args14.v;

  return function (input, gen_args, run_args) {
    var vv = freeze_values(value, run_args, gen_args);

    if (vv === 0) {
      return 0;
    }

    return undefault(input, 0) % vv;
  };
};

_functions.slew = function (args) {
  var _expand_args15 = expand_args({
    r: 1,
    x: Number.MAX_VALUE
  }, args),
      rate = _expand_args15.r,
      max = _expand_args15.x;

  return function (input, gen_args, run_args) {
    var _freeze_values17 = freeze_values([rate, max], run_args, gen_args),
        _freeze_values18 = _slicedToArray(_freeze_values17, 2),
        rv = _freeze_values18[0],
        xv = _freeze_values18[1];

    if (!gen_args.private_state.prev) {
      gen_args.private_state.prev = input;
    }

    var genin = input;

    if (typeof genin === 'undefined') {
      genin = gen_args.private_state.prev;
    }

    var diff = genin - gen_args.private_state.prev;

    if (rv > 0) {
      diff = diff * (1 - 1 / rv);
    }

    if (diff > 0) {
      if (diff > xv) {
        diff = xv;
      }
    } else if (diff < -xv) {
      diff = -xv;
    }

    var nv = gen_args.private_state.prev + diff;
    gen_args.private_state.prev = nv;
    return nv;
  };
};

_functions.map = function (args) {
  var _expand_args16 = expand_args({
    f: function f(x) {
      return x;
    }
  }, args),
      func = _expand_args16.f;

  return function (value, gen_args, run_args) {
    return func.apply(void 0, [value, gen_args].concat(_toConsumableArray(run_args)));
  };
};

_functions.beats = function (args) {
  var _expand_args17 = expand_args({
    s: 1,
    b: ud
  }, args),
      scale = _expand_args17.s,
      sbpm = _expand_args17.b;

  return function (input, gen_args, run_args) {
    var _freeze_values19 = freeze_values([scale, sbpm], run_args, gen_args),
        _freeze_values20 = _slicedToArray(_freeze_values19, 2),
        sv = _freeze_values20[0],
        bv = _freeze_values20[1];

    var time = run_args.time,
        bpm = run_args.bpm;
    var abpm = bv;

    if (typeof abpm === 'undefined') {
      abpm = bpm;
    }

    gen_args.values.time = undefault(time, 0) / 60 * abpm * sv;
    return input;
  };
};

_functions.use = function (args) {
  var _expand_args18 = expand_args({
    n: "val",
    c: false
  }, args),
      name = _expand_args18.n,
      copy = _expand_args18.c;

  return function (input, gen_args, run_args) {
    var _freeze_values21 = freeze_values([name, copy], run_args, gen_args),
        _freeze_values22 = _slicedToArray(_freeze_values21, 2),
        nv = _freeze_values22[0],
        cv = _freeze_values22[1];

    var ret = gen_args.values[nv];

    if (cv) {
      ret = input;
    }

    gen_args.current_value = nv;
    return ret;
  };
};

_functions.noop = function () {
  return function (input) {
    return input;
  };
};

_functions.gen = _functions.noop;

_functions.used = function () {
  return function (_, gen_args) {
    return gen_args.current_value;
  };
};

var run_calls = function run_calls(global_state, instance_state, calls, args) {
  var run_args = args;

  if (typeof run_args === 'undefined' || run_args.length === 0) {
    run_args = [{}];
  }

  if (typeof run_args[0] === 'undefined') {
    run_args[0] = {};
  }

  var gen_args = {
    input: ud,
    current_value: "val",
    values: _objectSpread({
      val: ud,
      initial_args: args
    }, run_args[0]),
    global_state: global_state,
    instance_state: instance_state,
    private_state: {}
  };
  gen_args.values.initial_time = get_time(gen_args.values, gen_args.values);
  gen_args.values.time = gen_args.values.initial_time;
  run_args[0] = gen_args.values;
  calls.forEach(function (_ref2) {
    var _ref3 = _slicedToArray(_ref2, 2),
        fncall = _ref3[0],
        private_state = _ref3[1];

    gen_args.private_state = private_state;
    gen_args.input = gen_args.values[gen_args.current_value];
    var res = fncall(gen_args.input, gen_args, run_args);
    gen_args.values[gen_args.current_value] = res;
  });
  var rval = gen_args.values[gen_args.current_value];

  if (typeof rval === 'undefined') {
    return 0;
  }

  return rval;
};

var sub_call = function sub_call(global_state, prev_calls, fun) {
  var calls = prev_calls.map(function (x) {
    return [x, {}];
  });
  var instance_state = {};

  if (typeof fun !== 'undefined') {
    calls.push([fun, {}]);
  }

  var rfun = function rfun() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return run_calls(global_state, instance_state, calls, args);
  };

  rfun.run = rfun;
  rfun[CANARY] = true;
  Object.entries(_functions).forEach(function (_ref4) {
    var _ref5 = _slicedToArray(_ref4, 2),
        name = _ref5[0],
        gen = _ref5[1];

    if (name in rfun && !(name in Object.getOwnPropertyNames())) {
      throw new Error("".concat(name, " already exists on parents of rfun"));
    }

    rfun[name] = function () {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return sub_call(global_state, calls.map(function (_ref6) {
        var _ref7 = _slicedToArray(_ref6, 1),
            call = _ref7[0];

        return call;
      }), gen(args));
    };
  });
  return rfun;
};

var get_global_env = function get_global_env() {
  if (typeof window !== 'undefined') {
    return window;
  }

  return global;
};

var make_new_lfo = function make_new_lfo(state) {
  var fdef = {};
  var global_state = typeof state === 'undefined' ? {} : state;
  Object.keys(_functions).forEach(function (name) {
    fdef[name] = function () {
      var _sub_call;

      return (_sub_call = sub_call(global_state, []))[name].apply(_sub_call, arguments);
    };
  });

  fdef.__release = function (new_lfo) {// for future use, e.g. to stop timeouts etc
  };

  return fdef;
};

var GLOBAL_INIT_ID = "__hydralfo_global";

var init = function init() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ud;
  var init_global = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  var force = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var new_lfo = make_new_lfo(state);

  if (!init_global) {
    return new_lfo;
  }

  var env = get_global_env();

  if (typeof env !== 'undefined') {
    if (CANARY in env) {
      var old_lfo = env[CANARY];

      if (_typeof(old_lfo) === 'object') {
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

exports.init = init;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}]},{},[1])(1)
});
//# sourceMappingURL=hydralfo.js.map
