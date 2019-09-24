/* eslint-disable max-lines-per-function */
/* eslint-env mocha */
"use strict";

const assert = require('assert');
const rewire = require("rewire");
const hydralfo = rewire("../../src/hydralfo");
const L = hydralfo.init();

// eslint-disable-next-line no-empty-function
const ud = ((function () {})());

describe('Mofifier functions', function () {
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
                [ud, 0, 1000, 0.5]
                , [{}, 0, 1000, 0.5]
                , [{s: 0.5, i: 1, t: 'h'}, 0, 1000, 0.5]
                , [{s: 1, i: 1, t: 'h'}, 0, 1000, 0.5]
            ].forEach(([parms, start, cnt, stepsz], cknum) => {
                p.x = start;
                const fnx = L.set(0).add(() => p.x).slew(parms).gen();

                Array(Math.floor(cnt / stepsz)).fill(1).forEach((_, i) => {
                    v = fnx({time: time++});
                    assert.equal(v, start + ((i) * stepsz), `${cknum}: start=${start} tgt=${cnt} i=${i} v=${v}`);
                });
            });

        });
    });

    
});

