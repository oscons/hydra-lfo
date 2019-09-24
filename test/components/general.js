/* eslint-disable max-lines-per-function */
/* eslint-env mocha */
"use strict";

const assert = require('assert');
const rewire = require("rewire");
const hydralfo = rewire("../../src/hydralfo");
const L = hydralfo.init();

// eslint-disable-next-line no-empty-function
const ud = ((function () {})());

describe('General functions', function () {
    describe('use', function () {
        it("should be able to handle different uses", function () {
            const fn = L
                .use("time").add(1)
                .use({c: true}).add(1)
                .use("foobar", true).add(1)
                .use("baz", false).add(1);

            assert.equal(fn.use("time").run({time: 0}), 1);
            assert.equal(fn.use("val").run({time: 0}), 2);
            assert.equal(fn.use("foobar").run({time: 0, foobar: 100}), 3);
            assert.equal(fn.use("baz").run({time: 0, baz: 100}), 101);

        });
    });
    describe('used', function () {
        it('should return the last used var name', function () {
            const args = [[], [ud], [{}], [{time: 1}]];
            args.forEach((arg, i) => {
                assert.equal(L.used().run(arg), "val", `arg:${i + 1}`);
                assert.equal(L.use().used().run(arg), "val", `arg:${i + 1}`);
                assert.equal(L.use("foo").used().run(arg), "foo", `arg:${i + 1}`);
                assert.equal(L.use("foo").used().run(arg), "foo", `arg:${i + 1}`);
                assert.equal(L.use("bar").use("foo").used().run(arg), "foo", `arg:${i + 1}`);
                assert.equal(L.use("foo").use("bar").use("foo").used().run(arg), "foo", `arg:${i + 1}`);
            });
        });
    });
    describe('set', function () {
        [
            ["should handle zero values", [0, 0, 0]]
            , ["should handle undefined values", [ud, 5, 5], [5, ud, 0], [ud, ud, 0]]
            , ["should handle positive values", [1, 5, 5], [5, 1, 1], [5, 0, 0], [0, 5, 5]]
            , ["should handle negative values", [-1, -5, -5], [-5, -1, -1], [-5, 0, 0], [0, -5, -5]]
        ].forEach(([msg, ...cases]) => {
            it(`${msg}`, function () {
                cases.forEach(([start, value, expected], i) => {
                    const fn = L.set(start).set(value);
                    Array(10).fill(1).forEach(() => {
                        assert.equal(
                            fn.run()
                            , expected
                            , `case ${i + 1}`
                        );
                    });
                });
            });
        });
    });
    describe('noop', function () {
        it("should not modify anything", function () {
            assert.equal(L.set(10).noop().run(), 10);
            assert.equal(L.set(10).noop(ud).run(), 10);
            assert.equal(L.set(10).noop({}).run(), 10);
            assert.equal(L.set(10).noop({v: 100}).run(), 10);
            assert.equal(L.set(10).noop({time: 100}).run(), 10);

            assert.equal(L.set(10).noop().run({time: 200}), 10);
            assert.equal(L.set(10).noop(ud).run({time: 200}), 10);
            assert.equal(L.set(10).noop({}).run({time: 200}), 10);
            assert.equal(L.set(10).noop({v: 100}).run({time: 200}), 10);
            assert.equal(L.set(10).noop({time: 100}).run({time: 200}), 10);

        });
    });
    describe('gen', function () {
        it("should return the function chain", function () {
            const genf = L.set(10).gen();
            assert.equal(typeof genf, 'function');
            
            assert.equal(genf(), 10);
            assert.equal(genf({time: 200}), 10);
        });
    });
    
});
