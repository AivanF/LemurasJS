// https://github.com/AivanF/LemurasJS

// Extend
var C = require('./column');
var R = require('./row');
var T = require('./table');
// Insert
var U = require('./utils');
var P = require('./processing');
var F = require('./formula');

module.exports = Object.assign({
	utils: U,
	processing: P,
	formula: F,
	F: F.create_formula,
}, C, R, T);