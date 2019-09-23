/* eslint-disable max-lines-per-function */
/* eslint-env mocha */
"use strict";

const assert = require('assert');
const rewire = require("rewire");
const hydralfo = rewire("../src/hydralfo");
const L = hydralfo.init();

// eslint-disable-next-line no-empty-function
const ud = ((function () {})());

describe('Time functions', function () {
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
            , ["should scale the time value"
                , [1, {v: 2}, 500, 1000]
                , [1, 4, 500, 2000]
                , [1, {v: 0.5}, 500, 250]
                , [0, {v: 1}, 500, 500]
                , [ud, {v: 0.5}, 500, 250]
                , [2, {v: 1, m: 0.5}, 500, 750]
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
});
