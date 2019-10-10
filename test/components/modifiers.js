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

describe('Modifier functions', function () {
    describe('slew', function () {
        it("should slow down rate of change", function () {
            const p = {x: 0};
            const fn = L.set(0).add(() => p.x).slew(0.5).gen();
            let time = 1;

            let v = 0;

            p.x = 1;
            v = fn({time: time++});
            assert.equal(v, 1);

            p.x = 2;
            v = fn({time: time++});
            assert.equal(v, 1.5);
            v = fn({time: time++});
            assert.equal(v, 2);

            p.x = 2.25;
            v = fn({time: time++});
            assert.equal(v, 2.25);

            [
                [ud, 0, 240, 0.5]
                , [{}, 0, 240, 0.5]
                , [{s: 0.5, i: 1, t: 'h'}, 0, 240, 0.5]
                , [{s: 1, i: 1, t: 'h'}, 0, 240, 0.5]
            ].forEach(([parms, start, cnt, stepsz], cknum) => {
                p.x = start;
                const fnx = L
                    .set(0)
                    .add(() => p.x)
                    .slew(parms)
                    .gen();

                // call once to init
                assert.equal(fnx({time: time++}), start);

                const threshold = 0.0000001;
                Array(Math.floor(cnt / stepsz)).fill(1)
                    .forEach((_, i) => {
                        p.x = cnt;
                        v = fnx({time: time++});
                        assert.equal(
                            Math.abs((start + ((i + 1) * stepsz) - v)) < threshold
                            , true
                            , `check ${cknum + 1}: start=${start} tgt=${cnt} i=${i} v=${v} `
                                + `parms=${JSON.stringify(parms)}`
                        );
                    });
            });

        });
    });

    describe('sah', function () {
        it("should sample and hold values", function () {
            [
                [[ud], [0.5, 0.5], [1, 0.5], [1.5, 1.5], [100, 100]]
                , [[2], [0.5, 0.5], [1, 0.5], [1.5, 0.5], [2.5, 2.5], [100, 100]]
                , [[-2], [0.5, 0.5], [1, 0.5], [1.5, 0.5], [2.5, 2.5], [100, 100]]
                , [[{h: 2}], [0.5, 0.5], [1, 0.5], [1.5, 0.5], [2.5, 2.5], [100, 100]]
            ].forEach(([params, ...runs], i) => {

                const fn = L.range(1000, 0, 1).sah(...params).gen();

                runs.forEach(([runparm, expected], runnum) => {

                    const v = fn({time: runparm});

                    assert.equal(v, expected, `case ${i + 1}, run ${runnum + 1}: v=${v} expected=${expected}`);
                });
            });
        });
    });
});

