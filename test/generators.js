/* eslint-disable max-lines-per-function */
/* eslint-env mocha */
"use strict";

const assert = require('assert');
const L = require('../src/hydralfo');

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
});
