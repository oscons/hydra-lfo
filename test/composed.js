/* Copyright (C) 2019  oscons (github.com/oscons) */
/* GPLv2, See LICENSE for full license text       */
/* eslint-disable max-lines-per-function */
/* eslint-env mocha */
"use strict";

const assert = require('assert');
const rewire = require("rewire");
const hydralfo = rewire("../src/hydralfo");
const util = rewire("../src/components/util");
const L = hydralfo.init();

// eslint-disable-next-line no-empty-function
const ud = ((function () {})());

describe('Composed', function () {
    it("L.rnd(10).sah(0.5).choose([3,7,9,5])", function () {

        assert.equal(util.mix_values(10, 1, 0), 10);

        const fn = L.set(1).rnd(10).sah(0.5).choose([3, 7, 9, 5]).gen();
        const ret = Array(100).fill(1).map((_, x) => x / 4).map((time) => fn({time}));

        const cnt = ret.reduce((prev, x) => {
            if (typeof prev[x] === 'undefined') {
                prev[x] = 0;
            }
            prev[x]++;
            return prev;
        }, {});

        assert.equal(cnt[3] < 50, true);
        assert.equal(cnt[7] < 50, true);
        assert.equal(cnt[9] < 50, true);
        assert.equal(cnt[5] < 50, true);

    });
});
