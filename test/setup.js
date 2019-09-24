/* Copyright (C) 2019  oscons (github.com/oscons) */
/* GPLv2, See LICENSE for full license text       */
/* eslint-disable max-lines-per-function */
/* eslint-env mocha */
"use strict";

const assert = require('assert');
const rewire = require("rewire");
const hydralfo = rewire("../src/hydralfo");
const L = hydralfo.init();

// eslint-disable-next-line no-empty-function
const ud = ((function () {})());

