/* Copyright (C) 2019  oscons (github.com/oscons) */
/* GPLv2, See LICENSE for full license text       */
/* eslint-disable max-lines-per-function */
/* eslint-env mocha */
"use strict";

const assert = require('assert');
const rewire = require("rewire");
const hydralfo = rewire("../src/hydralfo");
const L = hydralfo.init();

// eslint-disable-next-line no-empty-function
const ud = ((function () {})());

describe('Overall', function () {
    
    describe("init", function () {
        it("Can multi init", function () {
            const my_state = {};

            let lfo0 = hydralfo.init({state: my_state, force: true});
            let lfo2 = hydralfo.init({state: my_state, force: false});

            lfo2.map((input, gen_args) => {
                gen_args.global_state.foo = 'bar';
                return input;
            }).run();

            assert.equal(my_state.foo, 'bar');

            const state2 = {};
            lfo2 = hydralfo.init({state: state2, init_global: false});

            lfo2.map((input, gen_args) => {
                gen_args.global_state.foo = 'baz';
                return input;
            }).run();

            lfo0.map((input, gen_args) => {
                gen_args.global_state.foo = 'alice';
                return input;
            }).run();

            assert.equal(my_state.foo, 'alice');
            assert.equal(state2.foo, 'baz');
            
        });
    });

    describe("behavior ", function () {
        it("Behaves like a function", function () {
            assert.equal(L.set(1)(), 1);
            assert.equal(L.time()({time: 1}), 1);
            assert.equal(L.time().mul(2)({time: 2}), 4);
        });
    });

    describe('state', function () {
        it("keeps separate state in the call chain", function () {
            const fn0 = L.use("foo");
            const fn1 = fn0.use("bar");

            assert.equal(fn0.used().run(), "foo");
            assert.equal(fn1.used().run(), "bar");
            assert.notEqual(fn1.used().run(), fn0.used().run());

        });
    });

    describe("composable", function () {
        it("recognizes the canary", function () {
            assert.equal(L.set(1).set(L.set(10)).run(), 10);
            assert.equal(L.set(1).map((i) => i).run(), 1);
        });
        it("does not fudge parent chain parameters to much", function () {
            const run_parms = [{time: 100, foo: "bar"}, "bar", [3, 2, 1], () => 1];
            
            assert.equal(
                L.use("time").set(10)
                    .add(L.use("time").mul(2).use().set(0))
                    .run(...run_parms)
                , 10
            );

            assert.deepEqual(run_parms[0], {time: 100, foo: "bar"});
            assert.equal(run_parms[1], "bar");
            assert.deepEqual(run_parms[2], [3, 2, 1]);
            assert.equal(typeof run_parms[3], 'function');
        });
    });
    describe("initial value", function () {
        it("is same as time", function () {
            assert.equal(L.noop().run({time: 120}), 120);
            assert.equal(L.noop().run({time: 120, bpm: 120}), 240);
            assert.notEqual(L.noop().run(), 120);
        });
    });
});

