/* eslint-disable max-lines-per-function */
/* eslint-env mocha */
"use strict";

const assert = require('assert');
const L = require('../src/hydralfo');

// eslint-disable-next-line no-empty-function
const ud = ((function () {})());

describe('Math functions', function () {
    describe('add', function () {
        [
            ["should handle zero values", [0, 0, 0]]
            , ["should handle undefined values", [ud, 5, 5], [5, ud, 5], [ud, ud, 0]]
            , ["should handle positive values", [1, 5, 6], [5, 1, 6], [5, 0, 5], [0, 5, 5]]
            , ["should handle negative values", [-1, -5, -6], [-5, -1, -6], [-5, 0, -5], [0, -5, -5]]
        ].forEach(([msg, ...cases]) => {
            it(`${msg}`, function () {
                cases.forEach(([start, value, expected], i) => {
                    const fn = L.add(start).add(value);
                    Array(10).fill(1).forEach(() => {
                        assert.equal(
                            fn.run()
                            , expected
                            , `case ${i + 1}`
                        );
                    });
                });
            });
        });
    });
    describe('mul', function () {
        [
            ["should handle zero values", [0, 1, 0], [1, 0, 0]]
            , ["should handle undefined values", [ud, 5, 0], [5, ud, 0], [ud, ud, 0]]
            , ["should handle positive values", [1, 5, 5], [5, 1, 5], [5.5, 2, 11], [2, 5.5, 11]]
            , ["should handle negative values", [-1, -5, 5], [-5, -1, 5], [-5, 0, 0], [0, -5, 0]]
            , ["should handle mixed values", [-1, 5, -5], [5, -1, -5], [-11, 0.5, -5.5], [-0.5, 11, -5.5]]
        ].forEach(([msg, ...cases]) => {
            it(`${msg}`, function () {
                cases.forEach(([start, value, expected], i) => {
                    const fn = L.add(start).mul(value);
                    Array(10).fill(1).forEach(() => {
                        assert.equal(
                            fn.run()
                            , expected
                            , `case ${i + 1}`
                        );
                    });
                });
            });
        });
    });
    describe('div', function () {
        [
            ["should handle zero values", [0, 1, 0]]
            , ["should handle undefined values", [ud, 5, 0], [1, ud, 1], [0, ud, 0], [-1, ud, -1]]
            , ["should handle positive values", [1, 5, 0.2], [5, 1, 5], [5.5, 0.5, 11], [2, 4, 0.5]]
            , ["should handle negative values", [-1, -5, 0.2], [-5, -1, 5], [0, -5, 0]]
            , ["should handle mixed values", [-1, 5, -0.2], [5, -1, -5], [-11, 0.5, -22], [-0.5, 10, -0.05]]
        ].forEach(([msg, ...cases]) => {
            it(`${msg}`, function () {
                cases.forEach(([start, value, expected], i) => {
                    const fn = L.add(start).div(value);
                    Array(10).fill(1).forEach(() => {
                        assert.equal(
                            fn.run()
                            , expected
                            , `case ${i + 1}`
                        );
                    });
                });
            });
        });
        it("should handle div by zero gracefully", function () {
            [[0, 0], [1, 0], [-1, 0]].forEach(([start, value], i) => {
                const fn = L.add(start).div(value);
                Array(10).fill(1).forEach((_, n) => {
                    const ret = fn.run();
                    assert.equal(typeof ret, 'number', `case ${i + 1}, iteration ${n}`);
                    assert.equal(
                        (start > 0 && ret > 100000)
                        || (start < 0 && ret < -100000)
                        || (start === 0 && ret === 0)
                        , true
                        , `case ${i + 1}, iteration ${n}: ${ret}`
                    );
                });
            });
        });
    });

});