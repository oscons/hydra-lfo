/* Copyright (C) 2019  oscons (github.com/oscons). All rights reserved.
 * Licensed under the GNU General Public License, Version 2.0.
 * See LICENSE file for more information */

import {ud, undefault, expand_args, freeze_values, mix_values, get_time, get_bpm} from "./util";

export const TAU = 2 * Math.PI;

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
    title: "Roud down to the nearest number of digits"
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


export const functions = {
    __category: "maths"
    , __doc: {
        title: "Math related functions"
        , description: `Various generally maths related functions that act on
Hydra LFO values.`
    }
    , ..._functions
};
