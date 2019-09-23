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

            let lfo0 = hydralfo.init(my_state, true, true);
            let lfo2 = hydralfo.init({}, true, false);

            lfo2.map((input, gen_args) => {
                gen_args.global_state.foo = 'bar';
                return input;
            }).run();

            assert.equal(my_state.foo, 'bar');
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
    });

});

