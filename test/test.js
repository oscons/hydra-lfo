/* eslint-disable max-lines-per-function */
/* eslint-env mocha */
"use strict";

const assert = require('assert');
const L = require('../src/hydralfo');

// eslint-disable-next-line no-empty-function
const ud = ((function () {})());

describe('Overall', function () {
    
    describe("As a function ", function () {
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

});
