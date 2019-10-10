/* Copyright (C) 2019  oscons (github.com/oscons). All rights reserved.
 * Licensed under the GNU General Public License, Version 2.0.
 * See LICENSE file for more information */

/* eslint-disable max-lines-per-function */
/* eslint-env mocha */
"use strict";

const assert = require('assert');
const rewire = require("rewire");
const hydralfo = rewire("../../src/hydralfo");
const L = hydralfo.init();

// eslint-disable-next-line no-empty-function
const ud = ((function () {})());

describe('Generators', function () {
    describe('range', function () {
        it("operates on the correct ranges", function () {
            [
                [ud, [ud], [0, 0], [1, 0.1], [9, 0.9], [10, 0], [-5, 0.5]]
                , [ud, [100], [0, 0], [1, 0.1], [9, 0.9], [50, 5], [-5, 99.5]]
                , [ud, [100, 2], [0, 2], [1, 2.1], [9, 2.9], [50, 7], [-5, 99.5]]
                , [ud, [100, 3, 2], [1, 5], [-1, 98]]
                , [ud, [{u: 100}], [0, 0]]
                , [ud, [{u: 100, l: 200}], [0, 100]]
                , [ud, [{u: 100, l: -200}], [0, -200]]
                , [ud, [{u: 100, l: 100}], [0, 100], [1, 100], [0.5, 100]]
                , [5, [ud], [0, 0.5], [1, 0.5], [9, 0.5], [10, 0.5], [-5, 0.5]]
                , [5, [100], [0, 0.5], [1, 0.5], [9, 0.5], [50, 0.5], [-5, 0.5]]
                , [5, [100, 2], [0, 2.5], [1, 2.5], [9, 2.5], [50, 2.5], [-5, 2.5]]
                , [5, [100, 3, 2], [1, 13], [-1, 13]]
            ].forEach(([init, params, ...runs], i) => {
                runs.forEach(([time, result], j) => {
                    const v = L.set(init).range(...params).run({time});
                    assert.equal(v, result, `case ${i + 1}.${j + 1}: v=${v} time=${time} expected=${result}`);
                });
            });
        });
    });
    describe('choose', function () {
        it("it chooses one of the presented values", function () {
            [
                [0, [[3, 2, 1]], 3]
                , [0, [[]], 0]
                , [ud, [[3, 2, 1]], 1]
                , [1, [[3, 2, 1]], 2]
                , [1, [{v: [3, 2, 1]}], 2]
                , [1, [{v: [3, 2, 1], s: 2}], 1]
                , [1, [{v: [3, 2, L.set(5)], s: 2}], 5]
                , [1, [{v: [3, 2, () => 4], s: 2}], 4]

                , [4, [{v: [3, 2, () => 4], s: 2}], 4]
                , [7, [{v: [3, 2, () => 4], s: 2}], 4]
                , [-1, [{v: [3, 2, () => 4], s: 2}], 4]

            ].forEach(([init, parms, result], i) => {
                const ret = L.set(init).choose(...parms).run({time: 5});

                assert.equal(ret, result, `case ${i + 1}: ${ret} != ${result}`);
            });
        });
        it("uses time as default input", function () {
            assert.equal(L.fast(2).choose([3, 2, 1, 0]).run({time: 1}), 1);
            assert.equal(L.slow(2).choose([3, 2, 1, 0]).run({time: 4}), 1);
        });
    });
    describe('sin', function () {
        const THRESHOLD = 0.000001;

        it("can handle uninitialized input", function () {
            const expected_value = (v) => (Math.sin(v * 2 * Math.PI) / 2) + 0.5;
            assert.equal(L.set(ud).set(ud, "time").sin().run(), expected_value(0.25));
            assert.equal(L.set(ud).sin().run({time: 0.5}), expected_value(0.5));
        });
        it("looks like a sine wave", function () {
            const nume = 200;
            const values = Array(nume).fill(1)
                .map((_, i) => Number(i) / nume)
                .map((x) => [x, Math.sin(x * 2 * Math.PI)]);
            
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
        
                        assert.equal(res < THRESHOLD, true, () => `${i}/${ri}: x=${x} e=${e} r=${r} res=${res}`);
                    });
                });

        });
    });
    ['rnd', 'rand'].forEach((randfun) => {
        describe(randfun, function () {
            [
                [ud, ud, 0, 1]
                , [ud, 2, 0, 2]
                , [ud, {s: 2, o: 1}, 1, 3]
                , [2, ud, 0, 1]
                , [2, 4, 0, 4]
                , [1, 10, 0, 10]
                , [2, {s: 4, o: 1, m: 0.5}, 1, 4]
            ].forEach(function ([set, parms, lower, upper], i) {
                it(`should return random values in the correct range [${lower},${upper})`, function () {
                    let ret = 0;
                    
                    const fn = L.set(set)[randfun](parms);
                    
                    ret = Array(1000).fill(1).map(() => fn.run());
                    ret.forEach((x) => {
                        assert.equal(typeof x, "number", `Not a number: ${x}`);
                    });

                    const specials = [0, 1, -1];

                    ret = ret.reduce((prev, curr) => {
                        prev.cnt++;

                        prev.min = Math.min(prev.min, curr);
                        prev.max = Math.min(prev.max, curr);

                        const vn = `v${curr}`;
                        if (typeof prev.agg[vn] === 'undefined') {
                            prev.agg[vn] = 0;
                        }
                        prev.agg[vn]++;
                        
                        return prev;
                    }, {
                        min: Number.MAX_SAFE_INTEGER
                        , max: Number.MIN_SAFE_INTEGER
                        , cnt: 0
                        , agg: specials.reduce((h, v) => {
                            h[`v${v}`] = 0;
                            return h;
                        }, {})
                    });

                    assert.equal(
                        ret.min >= lower && ret.max < upper
                        , true
                        , `Min/max out of range: min=${ret.min} max=${ret.max}`
                    );
                    const ucnt = ret.agg[`v${upper}`];
                    const lcnt = ret.agg[`v${lower}`];

                    // maximum percent of the time that a single value is allowed to occur
                    // since rnd returns "real" values, thresh could be set to 1
                    const thresh = 4;
                    assert.equal(lcnt < thresh, true, `case ${i}: lcnt=${lcnt}, ucnt=${ucnt}`);

                    Object.entries(ret.agg).forEach(([name, value]) => {
                        assert.equal(
                            value < thresh
                            , true
                            , `case ${i}: value=${name} cnt=${value} runs=${ret.cnt} thresh=${thresh}`
                        );
                    });

                    assert.equal(
                        typeof ucnt === 'undefined' || ucnt === 0
                        , true
                        , `case ${i}: lcnt=${lcnt}, ucnt=${ucnt}`
                    );

                    specials.forEach((special) => {
                        const sval = ret.agg[`v${special}`];
                        if (lower <= special && special <= upper) {
                            assert.equal(sval < thresh, true);
                        } else {
                            assert.equal(sval, 0);
                        }
                    });
                    
                });
            });
        });
    });

    describe('complex', function () {
        it("generates expected values", function () {
            [
                [0, [], [{}, 0]]
                , [ud, [], [{time: 0}, 0], [{time: 1}, 1], [{time: 3}, 1]]
                , [1, [], [{}, 1]]
                , [1, [[0, 1, 2]], [{}, 2]]
            ].forEach(([init, params, ...runs], caseno) => {
                
                runs.forEach(([runparm, result], runno) => {
                    const v = L.set(init).complex(...params).run(runparm);
                    assert.equal(
                        v
                        , result
                        , `case ${caseno + 1}, run ${runno + 1}: v=${v} expected=${result}`
                    );
                });
            });
        });
    });

});
