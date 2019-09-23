/* eslint-env mocha */
"use strict";

const assert = require('assert');
const L = require('../src/hydralfo');

// eslint-disable-next-line no-empty-function
const ud = ((function () {})());

describe("Utilities ", function () {

    describe("mix_values", function () {
        it("works as expected", function () {
            assert.equal(L.mix_values(1, 10, 0), 1);
            assert.equal(L.mix_values(10, 1, 0), 10);

            assert.equal(L.mix_values(1, 10, 1), 10);
            assert.equal(L.mix_values(10, 1, 1), 1);
            
            assert.equal(L.mix_values(1, 10, 0.5), 5.5);
            assert.equal(L.mix_values(10, 1, 0.5), 5.5);

            assert.equal(L.mix_values(1, 100, 0.5), 50.5);
            assert.equal(L.mix_values(100, 1, 0.5), 50.5);
        });
    });

    describe("undefault", function () {
        it("works as expected", function () {
            assert.equal(L.undefault(ud, 10), 10);
            assert.equal(L.undefault(ud, "foo"), "foo");
            assert.equal(typeof L.undefault(ud, ud), 'undefined');
            assert.equal(L.undefault(10, ud), 10);
            assert.equal(L.undefault(11, 10), 11);
        });
    });

    describe("get_time", function () {
        it("works as expected", function () {
            assert.notEqual(L.get_time(), 0);
            assert.notEqual(L.get_time({foo: 1}), 0);
            assert.notEqual(L.get_time({foo: 1}), 1);
            assert.equal(L.get_time({time: 1}), 1);
            assert.equal(L.get_time({time: 123}), 123);
            assert.notEqual(L.get_time({time: ud}), 0);
        });
    });

    describe("freeze_values", function () {
        it("works as expected", function () {
            const frozen = L.freeze_values([
                (args) => args[0]
                , (args) => args[1]
                , (args) => args[2]
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
            let xa = {};
            
            xa = L.expand_args({a: 1, b: ud}, [{a: 2}]);

            assert.equal(typeof xa, "object");
            assert.equal(typeof xa.a, 'function');
            assert.equal(xa.a(), 2);

            assert.equal(typeof xa.b, 'function');
            assert.equal(typeof xa.b(), 'undefined');

            xa = L.expand_args({a: 1}, [2]);

            assert.equal(typeof xa, "object");
            assert.equal(typeof xa.a, 'function');
            assert.equal(xa.a(), 2);

            const fn1 = () => 3;
            xa = L.expand_args({a: 1}, [{a: fn1}]);

            assert.equal(typeof xa, "object");
            assert.equal(typeof xa.a, 'function');
            assert.equal(xa.a(), 3);
        });
    });
});

describe('Generators', function () {
    describe('individual', function () {
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
        describe('add', function () {
            [
                ["should handle zero values", [0, 0, 0]]
                , ["should handle undefined values", [ud, 5, 5], [5, ud, 5], [ud, ud, 0]]
                , ["should handle positive values", [1, 5, 6], [5, 1, 6], [5, 0, 5], [0, 5, 5]]
                , ["should handle negative values", [-1, -5, -6], [-5, -1, -6], [-5, 0, -5], [0, -5, -5]]
            ].forEach(([msg, ...cases]) => {
                it(`${msg}`, function () {
                    cases.forEach(([start, value, expected], i) => {
                        const fn = L.add(start).add(value);
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
        describe('mul', function () {
            [
                ["should handle zero values", [0, 1, 0], [1, 0, 0]]
                , ["should handle undefined values", [ud, 5, 0], [5, ud, 0], [ud, ud, 0]]
                , ["should handle positive values", [1, 5, 5], [5, 1, 5], [5.5, 2, 11], [2, 5.5, 11]]
                , ["should handle negative values", [-1, -5, 5], [-5, -1, 5], [-5, 0, 0], [0, -5, 0]]
                , ["should handle mixed values", [-1, 5, -5], [5, -1, -5], [-11, 0.5, -5.5], [-0.5, 11, -5.5]]
            ].forEach(([msg, ...cases]) => {
                it(`${msg}`, function () {
                    cases.forEach(([start, value, expected], i) => {
                        const fn = L.add(start).mul(value);
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
        describe('div', function () {
            [
                ["should handle zero values", [0, 1, 0]]
                , ["should handle undefined values", [ud, 5, 0], [1, ud, 1], [0, ud, 0], [-1, ud, -1]]
                , ["should handle positive values", [1, 5, 0.2], [5, 1, 5], [5.5, 0.5, 11], [2, 4, 0.5]]
                , ["should handle negative values", [-1, -5, 0.2], [-5, -1, 5], [0, -5, 0]]
                , ["should handle mixed values", [-1, 5, -0.2], [5, -1, -5], [-11, 0.5, -22], [-0.5, 10, -0.05]]
            ].forEach(([msg, ...cases]) => {
                it(`${msg}`, function () {
                    cases.forEach(([start, value, expected], i) => {
                        const fn = L.add(start).div(value);
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
            it("should handle div by zero gracefully", function () {
                [[0, 0], [1, 0], [-1, 0]].forEach(([start, value], i) => {
                    const fn = L.add(start).div(value);
                    Array(10).fill(1).forEach((_, n) => {
                        const ret = fn.run();
                        assert.equal(typeof ret, 'number', `case ${i + 1}, iteration ${n}`);
                        assert.equal(
                            (start > 0 && ret > 100000)
                            || (start < 0 && ret < -100000)
                            || (start === 0 && ret === 0)
                            , true
                            , `case ${i + 1}, iteration ${n}: ${ret}`
                        );
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


        describe('time', function () {
            [
                ["should get the time value", [{}, 500, 500]]
                , ["should scale the time value", [{s: 2}, 500, 1000], [{s: 4}, 500, 2000], [{s: 0.5}, 500, 250]]
            ].forEach(([msg, ...cases]) => {
                it(`${msg}`, function () {
                    cases.forEach(([parms, time, expected], i) => {
                        const fn = L.time(parms);
                        Array(10).fill(1).forEach(() => {
                            assert.equal(
                                fn.run({time})
                                , expected
                                , `case ${i + 1}`
                            );
                        });
                    });
                });
            });

        });

        describe('speed', function () {
            [
                ["should not scale the time value", [1, {}, 500, 500], [1, ud, 500, 500], [1, [], 500, 500]]
                , ["should scale the time value", [1, {v: 2}, 500, 1000], [1, 4, 500, 2000], [1, {v: 0.5}, 500, 250]]
            ].forEach(([msg, ...cases]) => {
                it(`${msg}`, function () {
                    cases.forEach(([init, parms, time, expected], i) => {
                        let cparms = parms;
                        if (!Array.isArray(cparms)) {
                            cparms = [cparms];
                        }
                        
                        const fn1 = L.set(init).speed(...cparms).time();

                        Array(10).fill(1).forEach((_, n) => {
                            const ret1 = fn1.run({time});

                            assert.equal(
                                ret1
                                , expected
                                , `case ${i + 1}, iteration ${n}: r=${ret1} e=${expected} t=${time}`
                            );
                        });
                    });
                });
            });
        });

    });
    describe("As a function ", function () {
        it("Behaves like a function", function () {
            assert.equal(L.set(1)(), 1);
            assert.equal(L.time()({time: 1}), 1);
            assert.equal(L.time().mul(2)({time: 2}), 4);
        });
    });
});
