(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.hydralfo = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.gen = exports.noop = exports.used = exports.use = exports.rnd = exports.set = exports.slew = exports.choose = exports.iter = exports.range = exports.div = exports.mod = exports.mul = exports.fast = exports.speed = exports.time = exports.add = exports.start = exports.freeze_values = exports.get_time = exports.expand_args = exports.undefault = exports.mix_values = void 0;

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

var mix_values = function mix_values(a, b, m) {
  return m === 0 ? a : m === 1 ? b : a * (1 - m) + b * m;
};

exports.mix_values = mix_values;

var undefault = function undefault(x, def) {
  if (typeof x === 'undefined') {
    return def;
  }

  return x;
};

exports.undefault = undefault;

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
      vals[x] = function (call_args, call_gen_args) {
        var nargs = call_args;

        if (typeof nargs === 'undefined') {
          nargs = [];
        }

        return undefault(vx.apply(void 0, _toConsumableArray(nargs).concat([call_gen_args])), ax);
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

exports.expand_args = expand_args;

var get_time = function get_time(args) {
  var time = ud;

  if (_typeof(args) === 'object' && !Array.isArray(args)) {
    var atime = args.time;
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

exports.get_time = get_time;

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

exports.freeze_values = freeze_values;
var _functions = {};

_functions.add = function (args) {
  var _expand_args = expand_args({
    v: 0
  }, args),
      value = _expand_args.v;

  return function (run_args, gen_args) {
    var vv = freeze_values(value, run_args, gen_args);
    return undefault(gen_args.input, 0) + vv;
  };
};

_functions.speed = function (args) {
  var _expand_args2 = expand_args({
    v: ud,
    m: ud
  }, args),
      value = _expand_args2.v,
      mix = _expand_args2.m;

  return function (run_args, gen_args) {
    var _freeze_values = freeze_values([value, mix], run_args, gen_args),
        _freeze_values2 = _slicedToArray(_freeze_values, 2),
        vv = _freeze_values2[0],
        mv = _freeze_values2[1];

    var time_scale = 1;

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

_functions.fast = function (args) {
  var _expand_args3 = expand_args({
    s: ud,
    o: 0,
    m: 0
  }, args),
      scale = _expand_args3.s,
      offset = _expand_args3.o,
      mix = _expand_args3.m;

  return function (run_args, gen_args) {
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
      time_scale = gen_args.input;
    } else {
      time_scale = mix_values(sv, gen_args.input, mv);
    }

    gen_args.values.time = time_scale * gen_args.values.time + ov;
    return gen_args.input;
  };
};

_functions.time = function (args) {
  var _expand_args4 = expand_args({
    s: 1,
    o: 0
  }, args),
      scale = _expand_args4.s,
      offset = _expand_args4.o;

  return function (run_args, gen_args) {
    var _freeze_values5 = freeze_values([scale, offset], run_args, gen_args),
        _freeze_values6 = _slicedToArray(_freeze_values5, 2),
        sv = _freeze_values6[0],
        ov = _freeze_values6[1];

    return get_time.apply(void 0, _toConsumableArray(run_args)) * sv + ov;
  };
};

_functions.rnd = function (args) {
  var _expand_args5 = expand_args({
    s: 1,
    o: 0,
    m: 0
  }, args),
      scale = _expand_args5.s,
      offset = _expand_args5.o,
      mix = _expand_args5.m;

  return function (run_args, gen_args) {
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
      svx = gen_args.input;
    } else {
      svx = mix_values(svx, gen_args.input, mv);
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

  return function (run_args, gen_args) {
    var _freeze_values9 = freeze_values([step, upper, lower], run_args, gen_args),
        _freeze_values10 = _slicedToArray(_freeze_values9, 3),
        sv = _freeze_values10[0],
        uv = _freeze_values10[1],
        lv = _freeze_values10[2];

    var npi = 0;

    if (gen_args.private_state.prev) {
      var _gen_args$private_sta = gen_args.private_state.prev.spi,
          spi = _gen_args$private_sta === void 0 ? 0 : _gen_args$private_sta;
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

  return function (run_args, gen_args) {
    var _freeze_values11 = freeze_values([values, step], run_args, gen_args),
        _freeze_values12 = _slicedToArray(_freeze_values11, 2),
        vv = _freeze_values12[0],
        sv = _freeze_values12[1];

    var _ref = gen_args.private_state.prev ? gen_args.private_state.prev : {},
        _ref$pi = _ref.pi,
        pi = _ref$pi === void 0 ? 0 : _ref$pi;

    if (gen_args.private_state.prev) {
      pi = sv + pi + undefault(gen_args.input, 0);
    }

    gen_args.private_state.prev = {
      pi: pi
    };
    var vs = vv;
    var idx = Math.floor(pi);
    idx = idx % vs.length;
    var val = vs[idx];

    if (typeof val === 'function') {
      return val.apply(void 0, _toConsumableArray(run_args));
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

  return function (run_args, gen_args) {
    var _freeze_values13 = freeze_values([values, scale], run_args, gen_args),
        _freeze_values14 = _slicedToArray(_freeze_values13, 2),
        vv = _freeze_values14[0],
        sv = _freeze_values14[1];

    if (vv.length === 0) {
      return 0;
    }

    var idx = undefault(gen_args.input, 0);
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

_functions.sin = function () {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var _expand_args9 = expand_args({
    f: 1,
    s: 1,
    o: 0
  }, args),
      frequency = _expand_args9.f,
      scale = _expand_args9.s,
      offset = _expand_args9.o;

  return function (run_args, gen_args) {
    var _freeze_values15 = freeze_values([frequency, scale, offset], run_args, gen_args),
        _freeze_values16 = _slicedToArray(_freeze_values15, 3),
        fv = _freeze_values16[0],
        sv = _freeze_values16[1],
        ov = _freeze_values16[2];

    var time = 0;

    if (gen_args.input) {
      time = gen_args.input;
    } else {
      time = get_time.apply(void 0, _toConsumableArray(run_args).concat([gen_args]));
    }

    return (Math.sin(time * 2 * Math.PI * fv) / 2 + 0.5) * sv + ov;
  };
};

_functions.floor = function (args) {
  var _expand_args10 = expand_args({
    d: 0
  }, args),
      digits = _expand_args10.d;

  return function (run_args, gen_args) {
    var dv = freeze_values(digits, run_args, gen_args);
    var fact = Math.power(10, dv);
    return Math.floor(gen_args.input * fact) / fact;
  };
};

_functions.set = function (args) {
  var _expand_args11 = expand_args({
    v: 0
  }, args),
      value = _expand_args11.v;

  return function (run_args, gen_args) {
    var vv = freeze_values(value, run_args, gen_args);
    return vv;
  };
};

_functions.mul = function (args) {
  var _expand_args12 = expand_args({
    v: 0
  }, args),
      value = _expand_args12.v;

  return function (run_args, gen_args) {
    var vv = freeze_values(value, run_args, gen_args);
    return gen_args.input * vv;
  };
};

_functions.div = function (args) {
  var _expand_args13 = expand_args({
    v: 1
  }, args),
      value = _expand_args13.v;

  return function (run_args, gen_args) {
    var vv = freeze_values(value, run_args, gen_args);
    var definput = undefault(gen_args.input, 0);

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

  return function (run_args, gen_args) {
    var vv = freeze_values(value, run_args, gen_args);

    if (vv === 0) {
      return 0;
    }

    return undefault(gen_args.input, 0) % vv;
  };
};

_functions.slew = function (args) {
  var _expand_args15 = expand_args({
    r: 1,
    x: Number.MAX_VALUE
  }, args),
      rate = _expand_args15.r,
      max = _expand_args15.x;

  return function (run_args, gen_args) {
    var _freeze_values17 = freeze_values([rate, max], run_args, gen_args),
        _freeze_values18 = _slicedToArray(_freeze_values17, 2),
        rv = _freeze_values18[0],
        xv = _freeze_values18[1];

    if (!gen_args.private_state.prev) {
      gen_args.private_state.prev = gen_args.input;
    }

    var genin = gen_args.input;

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

  return function (run_args, gen_args) {
    return func.apply(void 0, _toConsumableArray(run_args).concat([gen_args]));
  };
};

_functions.beats = function (args) {
  var _expand_args17 = expand_args({
    s: 1,
    b: ud
  }, args),
      scale = _expand_args17.s,
      sbpm = _expand_args17.b;

  return function (run_args, gen_args) {
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
    return gen_args.input;
  };
};

_functions.use = function (args) {
  var _expand_args18 = expand_args({
    n: "val",
    c: false
  }, args),
      name = _expand_args18.n,
      copy = _expand_args18.c;

  return function (run_args, gen_args) {
    var _freeze_values21 = freeze_values([name, copy], run_args, gen_args),
        _freeze_values22 = _slicedToArray(_freeze_values21, 2),
        nv = _freeze_values22[0],
        cv = _freeze_values22[1];

    var ret = gen_args.values[nv];

    if (cv) {
      ret = gen_args.input;
    }

    gen_args.current_value = nv;
    return ret;
  };
};

_functions.noop = function () {
  return function (_, gen_args) {
    return gen_args.input;
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
  gen_args.values.initial_time = get_time(gen_args.values);
  gen_args.values.time = gen_args.values.initial_time;
  run_args[0] = gen_args.values;
  calls.forEach(function (_ref2) {
    var _ref3 = _slicedToArray(_ref2, 2),
        fncall = _ref3[0],
        private_state = _ref3[1];

    gen_args.private_state = private_state;
    gen_args.input = gen_args.values[gen_args.current_value];
    var res = fncall(run_args, gen_args);
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
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    return run_calls(global_state, instance_state, calls, args);
  };

  rfun.run = rfun;
  Object.entries(_functions).forEach(function (_ref4) {
    var _ref5 = _slicedToArray(_ref4, 2),
        name = _ref5[0],
        gen = _ref5[1];

    rfun[name] = function () {
      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
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

var start = function start() {
  var global_state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return sub_call(global_state, []);
};

exports.start = start;

var setup_init_call = function setup_init_call(fun) {
  var _start;

  for (var _len4 = arguments.length, args = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
    args[_key4 - 1] = arguments[_key4];
  }

  return (_start = start())[fun].apply(_start, args);
};
/* eslint-disable no-multi-spaces */


var add = function add() {
  for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
    args[_key5] = arguments[_key5];
  }

  return setup_init_call.apply(void 0, ["add"].concat(args));
};

exports.add = add;

var time = function time() {
  for (var _len6 = arguments.length, args = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
    args[_key6] = arguments[_key6];
  }

  return setup_init_call.apply(void 0, ["time"].concat(args));
};

exports.time = time;

var speed = function speed() {
  for (var _len7 = arguments.length, args = new Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
    args[_key7] = arguments[_key7];
  }

  return setup_init_call.apply(void 0, ["speed"].concat(args));
};

exports.speed = speed;

var fast = function fast() {
  for (var _len8 = arguments.length, args = new Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
    args[_key8] = arguments[_key8];
  }

  return setup_init_call.apply(void 0, ["fast"].concat(args));
};

exports.fast = fast;

var mul = function mul() {
  for (var _len9 = arguments.length, args = new Array(_len9), _key9 = 0; _key9 < _len9; _key9++) {
    args[_key9] = arguments[_key9];
  }

  return setup_init_call.apply(void 0, ["mul"].concat(args));
};

exports.mul = mul;

var mod = function mod() {
  for (var _len10 = arguments.length, args = new Array(_len10), _key10 = 0; _key10 < _len10; _key10++) {
    args[_key10] = arguments[_key10];
  }

  return setup_init_call.apply(void 0, ["mod"].concat(args));
};

exports.mod = mod;

var div = function div() {
  for (var _len11 = arguments.length, args = new Array(_len11), _key11 = 0; _key11 < _len11; _key11++) {
    args[_key11] = arguments[_key11];
  }

  return setup_init_call.apply(void 0, ["div"].concat(args));
};

exports.div = div;

var range = function range() {
  for (var _len12 = arguments.length, args = new Array(_len12), _key12 = 0; _key12 < _len12; _key12++) {
    args[_key12] = arguments[_key12];
  }

  return setup_init_call.apply(void 0, ["rang"].concat(args));
};

exports.range = range;

var iter = function iter() {
  for (var _len13 = arguments.length, args = new Array(_len13), _key13 = 0; _key13 < _len13; _key13++) {
    args[_key13] = arguments[_key13];
  }

  return setup_init_call.apply(void 0, ["iter"].concat(args));
};

exports.iter = iter;

var choose = function choose() {
  for (var _len14 = arguments.length, args = new Array(_len14), _key14 = 0; _key14 < _len14; _key14++) {
    args[_key14] = arguments[_key14];
  }

  return setup_init_call.apply(void 0, ["choose"].concat(args));
};

exports.choose = choose;

var slew = function slew() {
  for (var _len15 = arguments.length, args = new Array(_len15), _key15 = 0; _key15 < _len15; _key15++) {
    args[_key15] = arguments[_key15];
  }

  return setup_init_call.apply(void 0, ["slew"].concat(args));
};

exports.slew = slew;

var set = function set() {
  for (var _len16 = arguments.length, args = new Array(_len16), _key16 = 0; _key16 < _len16; _key16++) {
    args[_key16] = arguments[_key16];
  }

  return setup_init_call.apply(void 0, ["set"].concat(args));
};

exports.set = set;

var rnd = function rnd() {
  for (var _len17 = arguments.length, args = new Array(_len17), _key17 = 0; _key17 < _len17; _key17++) {
    args[_key17] = arguments[_key17];
  }

  return setup_init_call.apply(void 0, ["rnd"].concat(args));
};

exports.rnd = rnd;

var use = function use() {
  for (var _len18 = arguments.length, args = new Array(_len18), _key18 = 0; _key18 < _len18; _key18++) {
    args[_key18] = arguments[_key18];
  }

  return setup_init_call.apply(void 0, ["use"].concat(args));
};

exports.use = use;

var used = function used() {
  for (var _len19 = arguments.length, args = new Array(_len19), _key19 = 0; _key19 < _len19; _key19++) {
    args[_key19] = arguments[_key19];
  }

  return setup_init_call.apply(void 0, ["used"].concat(args));
};

exports.used = used;

var noop = function noop() {
  for (var _len20 = arguments.length, args = new Array(_len20), _key20 = 0; _key20 < _len20; _key20++) {
    args[_key20] = arguments[_key20];
  }

  return setup_init_call.apply(void 0, ["noop"].concat(args));
};

exports.noop = noop;

var gen = function gen() {
  for (var _len21 = arguments.length, args = new Array(_len21), _key21 = 0; _key21 < _len21; _key21++) {
    args[_key21] = arguments[_key21];
  }

  return setup_init_call.apply(void 0, ["gen"].concat(args));
};

exports.gen = gen;

},{}]},{},[1])(1)
});
//# sourceMappingURL=hydralfo.js.map
