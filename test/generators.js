/* eslint-disable max-lines-per-function */
/* eslint-env mocha */
"use strict";

const assert = require('assert');
const rewire = require("rewire");
const hydralfo = rewire("../src/hydralfo");
const L = hydralfo.init();

// eslint-disable-next-line no-empty-function
const ud = ((function () {})());

describe('Generators', function () {
    describe('choose', function () {
        it("it chooses one of the presented values", function () {
            [
                [0, [[3, 2, 1]], 3]
                , [ud, [[3, 2, 1]], 3]
                , [1, [[3, 2, 1]], 2]
                , [1, [{v: [3, 2, 1]}], 2]
                , [1, [{v: [3, 2, 1], s: 2}], 1]
                , [1, [{v: [3, 2, L.set(5)], s: 2}], 5]
                , [1, [{v: [3, 2, () => 4], s: 2}], 4]
            ].forEach(([init, parms, result], i) => {
                const ret = L.set(init).choose(...parms).run();

                assert.equal(ret, result, `case ${i + 1}: ${ret} != ${result}`);
            });
        });
    });
    describe('sin', function () {
        it("looks like a sine wave", function () {
            const nume = 200;
            const values = Array(nume).fill(1)
                .map((_, i) => Number(i) / nume)
                .map((x) => [x, Math.sin(x * 2 * Math.PI)]);

            const threshold = 0.00001;
            values.map(([x, e]) => [
                x
                , e
                , [L.sin({f: 1, s: 2, o: -1}).run({time: x})
                    , L.sin(1, 2, -1).run({time: x})
                    , L.set(x).sin(1, 2, -1).run()
                ]])
                .forEach(([x, e, rall], i) => {
                    rall.forEach((r, ri) => {
                        const res = Math.abs(r - e);
        
                        assert.equal(res < threshold, true, `${i}/${ri}: x=${x} e=${e} r=${r} res=${res}`);
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
