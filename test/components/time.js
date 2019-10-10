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

describe('Time functions', function () {
    describe('time', function () {
        [
            ["should get the time value", [{}, 600, 600]]
            , ["should scale the time value", [{s: 2}, 600, 1200], [{s: 4}, 600, 2400], [{s: 0.5}, 600, 300]]
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
            ["should not scale the time value", [1, {}, 600, 600], [1, ud, 600, 600], [1, [], 600, 600]]
            , ["should scale the time value"
                , [1, {v: 2}, 600, 1200]
                , [1, 4, 600, 2400]
                , [1, {v: 0.5}, 600, 300]
                , [0, {v: 1}, 600, 600]
                , [ud, {v: 0.5}, 600, 300]
                , [2, {v: 1, m: 0.5}, 600, 900]
            ]
        ].forEach(([msg, ...cases]) => {
            it(`${msg}`, function () {
                cases.forEach(([init, parms, time, expected], i) => {
                    let cparms = parms;
                    if (!Array.isArray(cparms)) {
                        cparms = [cparms];
                    }
                    
                    let fn1 = L;
                    if (typeof init !== 'undefined') {
                        fn1 = fn1.set(init);
                    }
                    fn1 = fn1.speed(...cparms).time();

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
    ["slow", "fast"].forEach((fun) => {
        describe(fun, function () {
            it("does what it should", function () {
                [
                    [0, [], [2, 0, 2], [0, 0, 0]]
                    , [ud, [0], [2, 0, 2], [0, 0, 0]]
                    
                    , [ud, [], [2, 2, 2], [0, 0, 0]]
                    , [ud, [{}], [2, 2, 2], [0, 0, 0]]
                    , [2, [], [2, 4, 1], [0, 0, 0], [1, 2, 0.5]]
                    , [2, [{}], [2, 4, 1], [0, 0, 0], [1, 2, 0.5]]

                    , [ud, [4], [2, 8, 0.5], [0, 0, 0]]
                    , [ud, [{s: 4}], [2, 8, 0.5], [0, 0, 0]]
                    , [2, [4], [2, 8, 0.5], [0, 0, 0], [1, 4, 0.25]]
                    , [2, [{s: 4}], [2, 8, 0.5], [0, 0, 0], [1, 4, 0.25]]

                    , [2, [2, 2], [2, 6, 3], [0, 2, 2], [1, 4, 2.5]]
                    , [2, [{s: 2, o: 2}], [2, 6, 3], [0, 2, 2], [1, 4, 2.5]]

                    , [2, [3, 1, 0.5], [
                        2
                        , (2 *      (2 + 3) / 2)  + 1
                        , (2 * 1 / ((2 + 3) / 2)) + 1]
                    ]
                    , [2, [{s: 3, o: 1, m: 0.5}], [
                        2
                        , (2 *      (2 + 3) / 2)  + 1
                        , (2 * 1 / ((2 + 3) / 2)) + 1]
                    ]

                ].forEach(([init, params, ...runs], i) => {
                    const fn = L.set(init)[fun](...params);

                    runs.forEach(([time, fast_res, slow_res], j) => {
                        
                        const fexpected = fun === 'slow' ? slow_res : fast_res;
                        const v = fn.time().run({time});
                        const v2 = fn.gen({return_undef: true})({time});
                        assert.equal(v2, init);
                        assert.equal(
                            v
                            , fexpected
                            , `case ${i + 1}, run ${j + 1}: r=${v} `
                                + `expected=${fexpected} i=${init} t=${time} s=${slow_res} f=${fast_res}`
                        );
                    });
                });
            });
        });
    });
});
