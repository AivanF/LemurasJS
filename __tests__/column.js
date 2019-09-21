
const m_data = require('./sample_data.js');
const m_column = require('../lemuras/column.js');
const m_formula = require('../lemuras/formula.js');
const F = m_formula.formula;

let cdates = new m_column.Column(['2018-12-30', '14.09.1983', '02/15/1916'], 'Dates');

describe('Column class', function () {
	test('Creation', function () {
		// Column constructor arguments:
		// values, title, table, source_name

		function create_no_args() {
			var t = new m_column.Column();
		};
		expect(create_no_args).toThrow(Error);

		function create_too_many_args() {
			var t = new m_column.Column([], null, m_data.df1, 'size');
		};
		expect(create_too_many_args).toThrow(Error);

		function create_table_no_field() {
			var t = new m_column.Column(null, null, m_data.df1);
		};
		expect(create_table_no_field).toThrow(Error);
	});

	test('Basic', function () {
		var df2 = m_data.df1.copy();
		df2.column('type').set_value(1, 'C');
		expect(df2.column('type').calc('nunique')).toEqual(m_data.df1.column('type').calc('nunique') + 1);

		function apply_bad_name() {
			var t = df2.column('size').apply('random_name');
		};
		expect(apply_bad_name).toThrow(Error);
	});

	test('Compare', function () {
		var df2 = m_data.df1.copy();
		expect(F('df[["weight"]] == 12')(df2).calc('sum')).toEqual(3);
		expect(F('df[["weight"]] <  12')(df2).calc('sum')).toEqual(1);
		expect(F('df[["weight"]] >  df[["size"]]')(df2).calc('sum')).toEqual(6);
	});

	test('Operators', function () {
		var df2 = m_data.df1.copy();
		// Simple math operations
		expect(df2.column('weight').eq(12).calc('sum')).toEqual(3);
	});

	// test('Basic', function () {
	// });
});