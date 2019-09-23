/* eslint-disable max-lines-per-function */
/* eslint-env mocha */
"use strict";

const assert = require('assert');
const L = require('../src/hydralfo');

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
