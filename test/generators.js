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
    describe('choose', function () {
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
                ]])
                .forEach(([x, e, rall], i) => {
                    rall.forEach((r, ri) => {
                        const res = Math.abs(r - e);
        
                        assert.equal(res < threshold, true, `${i}/${ri}: x=${x} e=${e} r=${r} res=${res}`);
                    });
                });

        });
    });
});
