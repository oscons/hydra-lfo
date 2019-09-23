/* eslint-disable max-lines-per-function */
/* eslint-env mocha */
"use strict";

const assert = require('assert');
const L = require('../src/hydralfo');

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

    describe('rnd', function () {
        [
            [ud, ud, 0, 1]
            , [ud, 2, 0, 2]
            , [ud, {s: 2, o: 1}, 1, 3]
            , [2, ud, 0, 1]
            , [2, 4, 0, 4]
            , [2, {s: 4, o: 1, m: 0.5}, 1, 4]
        ].forEach(function ([set, parms, lower, upper]) {
            it(`should return random values in the correct range [${lower},${upper})`, function () {
                let ret = 0;
                
                let fn = L.rnd(parms);
                if (typeof set !== 'undefined') {
                    fn = L.set(set).rnd(parms);
                }
                
                ret = Array(1000).fill(1).map(() => fn.run());
                ret.forEach((x) => {
                    assert.equal(typeof x, "number", `Not a number: ${x}`);
                });
                ret = ret.reduce((prev, curr) => {
                    prev.cnt++;

                    prev.min = Math.min(prev.min, curr);
                    prev.max = Math.min(prev.max, curr);

                    try {
                        prev.agg[`v${curr}`]++;
                    } catch (e) {
                        prev.agg[`v${curr}`] = 1;
                    }

                    return prev;
                }, {
                    min: Number.MAX_SAFE_INTEGER
                    , max: Number.MIN_SAFE_INTEGER
                    , cnt: 0
                    , agg: {v0: lower, v1: upper}
                });

                assert.equal(
                    ret.min >= lower && ret.max < upper
                    , true
                    , `Min/max out of range: min=${ret.min} max=${ret.max}`
                );
                assert.equal(ret.agg.v0 < ret.cnt * 0.1, true);

            });
        });
    });
});
