
const m_data = require('./sample_data.js');
const m_column = require('../lemuras/column.js');
const m_formula = require('../lemuras/formula.js');
const F = m_formula.create_formula;

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
		expect(F('df[["weight"]] - df[["size"]]')(df2).calc('sum')).toEqual(55);
		expect(F('df[["weight"]] + df[["size"]]')(df2).calc('sum')).toEqual(95);
		expect(F('df[["weight"]] * df[["size"]]')(df2).calc('sum')).toEqual(258);
		// Complex math operations
		expect(F('#(df[["weight"]] - (df[["size"]] * 10))')(df2).calc('sum')).toEqual(129);
		expect(Math.floor(1000*F('df[["weight"]] / df[["size"]]')(df2).calc('avg'))).toEqual(5069);
		// Logical operations & comparison
		expect(F('(df[["weight"]] < 12) || (df[["weight"]] > 12)')(df2).calc('sum')).toEqual(3);
		expect(F('(df[["weight"]] <= 12) && (df[["weight"]] == 12)')(df2).calc('sum')).toEqual(F('df[["weight"]] == 12')(df2).calc('sum'));
		expect(F('!(df[["weight"]] <= 12)')(df2).calc('sum')).toEqual(2);
		// With array
		function add_wrong_length() {
			var t = df2.column('weight').add([1, 2, 3]);
		};
		expect(add_wrong_length).toThrow(Error);
		expect(F('df[["weight"]] + [1,2,3,4,5,6]')(df2).calc('sum')).toEqual(96);
		// Contains operator
		expect(df2.column('size').indexOf(123) < 0).toBeTruthy();
		expect(df2.column('size').indexOf(4) >= 0).toBeTruthy();
	});

	test('Agg', function () {
		var df2 = m_data.df1.copy();
		expect(df2.column('weight').calc('avg')).toEqual(12.5);
		expect(Math.floor(1000*df2.column('weight').calc('std'))).toEqual(1607);
		expect(df2.column('weight').calc('q1')).toEqual(12.0);
		expect(df2.column('weight').calc('median')).toEqual(12.0);
		expect(df2.column('weight').calc('q3')).toEqual(13.5);
		// expect(df2.column('weight').calc('mode')).toEqual(12); // TODO: implement mode
		expect(df2.column('weight').calc('count')).toEqual(6);
		expect(df2.column('weight').calc('nunique')).toEqual(4);
		expect(df2.column('type').calc('nunique')).toEqual(2);
		expect(df2.column('size').calc('min')).toEqual(1);
		expect(df2.column('size').calc('max')).toEqual(6);
		expect(df2.column('size').calc('first')).toEqual(1);
		expect(df2.column('size').calc('get', 0)).toEqual(1);
		expect(df2.column('size').calc('last')).toEqual(2);
		expect(df2.column('size').calc('get', df2.rowcnt-1)).toEqual(2);

		// Percentile function works a bit different for odd and even lengths
		// So, let's test both options
		var temp = df2.column('weight').copy();
		temp.values.push(df2.column('weight').calc('mean'));
		expect(temp.calc('q2')).toEqual(df2.column('weight').calc('q2'));
	});

	test('Types', function () {
		var df2 = m_data.df1.copy();
		expect(df2.column('tel').copy().apply('str').apply('is_string').calc('sum')).toEqual(df2.rowcnt);
		expect(df2.column('tel').copy().apply('int').apply('is_int', Number).calc('sum')).toEqual(df2.rowcnt);
		// TODO: here...
		;
	});
});