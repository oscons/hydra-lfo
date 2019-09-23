/* eslint-disable max-lines-per-function */
/* eslint-env mocha */
"use strict";

const assert = require('assert');
const rewire = require("rewire");
const hydralfo = rewire("../src/hydralfo");
const L = hydralfo.init();

// eslint-disable-next-line no-empty-function
const ud = ((function () {})());

describe("Utilities ", function () {
    describe("mix_values", function () {
        it("works as expected", function () {
            const mix_values = hydralfo.__get__("mix_values");
            assert.equal(mix_values(1, 10, 0), 1);
            assert.equal(mix_values(10, 1, 0), 10);

            assert.equal(mix_values(1, 10, 1), 10);
            assert.equal(mix_values(10, 1, 1), 1);
            
            assert.equal(mix_values(1, 10, 0.5), 5.5);
            assert.equal(mix_values(10, 1, 0.5), 5.5);

            assert.equal(mix_values(1, 100, 0.5), 50.5);
            assert.equal(mix_values(100, 1, 0.5), 50.5);
        });
    });

    describe("undefault", function () {
        it("works as expected", function () {
            const undefault = hydralfo.__get__("undefault");
            assert.equal(undefault(ud, 10), 10);
            assert.equal(undefault(ud, "foo"), "foo");
            assert.equal(typeof undefault(ud, ud), 'undefined');
            assert.equal(undefault(10, ud), 10);
            assert.equal(undefault(11, 10), 11);
        });
    });

    describe("get_time", function () {
        it("works as expected", function () {
            const get_time = hydralfo.__get__("get_time");
            assert.notEqual(get_time(), 0);
            assert.notEqual(get_time({}, {foo: 1}), 0);
            assert.notEqual(get_time({}, {foo: 1}), 1);
            assert.equal(get_time({}, {time: 1}), 1);
            assert.equal(get_time({}, {time: 0}), 0);
            assert.equal(get_time({}, {time: 123}), 123);
            assert.notEqual(get_time({}, {time: ud}), 0);
            assert.equal(get_time({values: {time: 33}}, {time: ud}), 33);
            assert.equal(get_time({values: {time: 33}}, {}), 33);
            assert.equal(get_time({values: {time: 33}}, ud), 33);
        });
    });

    describe("freeze_values", function () {
        it("works as expected", function () {
            const freeze_values = hydralfo.__get__("freeze_values");
            const frozen = freeze_values([
                (...args) => args[0]
                , (...args) => args[1]
                , (...args) => args[2]
                , ud
                , 7
            ], [1, 2, 3, ud, ud]);

            assert.equal(frozen.length, 5);
            assert.equal(frozen[0], 1);
            assert.equal(frozen[1], 2);
            assert.equal(frozen[2], 3);
            assert.equal(typeof frozen[3], 'undefined');
            assert.equal(frozen[4], 7);
            
        });
    });

    describe("expand_args", function () {
        it("Can parse args", function () {
            const expand_args = hydralfo.__get__("expand_args");
            let xa = {};
            
            xa = expand_args({a: 1, b: ud}, [{a: 2}]);

            assert.equal(typeof xa, "object");
            assert.equal(typeof xa.a, 'function');
            assert.equal(xa.a(), 2);

            assert.equal(typeof xa.b, 'function');
            assert.equal(typeof xa.b(), 'undefined');

            xa = expand_args({f: 1, s: 1, o: 0}, ud);

            assert.equal(typeof xa, "object");
            assert.equal(typeof xa.f, 'function');
            assert.equal(typeof xa.s, 'function');
            assert.equal(typeof xa.o, 'function');
            assert.equal(xa.f(), 1);
            assert.equal(xa.s(), 1);
            assert.equal(xa.o(), 0);

            xa = expand_args({a: 1}, [2]);

            assert.equal(typeof xa, "object");
            assert.equal(typeof xa.a, 'function');
            assert.equal(xa.a(), 2);

            xa = expand_args({a: 1, b: ud}, [[3, 2, 1], 4]);

            assert.equal(typeof xa, "object");
            assert.equal(typeof xa.a(), 'object');
            assert.equal(Array.isArray(xa.a()), true);
            assert.equal(xa.a().length, 3);
            assert.deepEqual(xa.a(), [3, 2, 1]);
            assert.equal(typeof xa.b(), 'number');
            assert.equal(xa.b(), 4);

            let fn1 = () => 3;
            xa = expand_args({a: 1}, [{a: fn1}]);

            assert.equal(typeof xa, "object");
            assert.equal(typeof xa.a, 'function');
            assert.equal(xa.a(), 3);

            fn1 = L.set(3);
            xa = expand_args({a: 1}, [{a: fn1}]);

            assert.equal(typeof xa, "object");
            assert.equal(typeof xa.a, 'function');
            assert.equal(xa.a(), 3);

        });
    });
});
