
const lemuras = require('../lemuras/init.js');

const cols1 = ['type', 'size', 'weight', 'tel'];
const rows1 = [
	['A', 2, 12, '+79360360193'],
	['B', 1, 12, 84505505151],
	['D', 1, 10, '31415926535'],
	['B', 2, 14, ''],
	['A', 1, 15, '23816326412'],
	['D', 2, 11, 0],
];
const df1 = new lemuras.Table(cols1, rows1);

const cols2 = ['type', 'size', 'cost'];
const rows2 = [
	['A', 2, 3.1415],
	['B', 1, 2.7182],
	['C', 2, 1.2345],
	['D', 1, 1.2345],
];
const df2 = new lemuras.Table(cols2, rows2);

const cnt_inner = 3;
const cnt_left = 3;
const cnt_right = 1;

describe('Table Merge', function () {
	test('Inner', function () {
		const df3 = lemuras.Table.merge(df1, df2, ['type', 'size'], 'inner');
		df3.rows.forEach(function (row) {
			expect(row.length).toEqual(df3.colcnt);
		});
		expect(df3.rowcnt).toEqual(cnt_inner);
		expect(df3.columns).toEqual(['type', 'size', 'weight', 'tel', 'cost']);
		expect(df3.column('weight').calc('sum')).toEqual(34);
	});

	test('Left', function () {
		const df3 = lemuras.Table.merge(df1, df2, ['type', 'size'], 'left');
		df3.rows.forEach(function (row) {
			expect(row.length).toEqual(df3.colcnt);
		});
		expect(df3.rowcnt).toEqual(cnt_inner+cnt_left);
		expect(df3.columns).toEqual(['type', 'size', 'weight', 'tel', 'cost']);
		expect(df3.column('weight').calc('sum')).toEqual(74);
	});

	test('Right', function () {
		const df3 = lemuras.Table.merge(df1, df2, ['type', 'size'], 'right');
		df3.rows.forEach(function (row) {
			expect(row.length).toEqual(df3.colcnt);
		});
		expect(df3.rowcnt).toEqual(cnt_inner+cnt_right);
		expect(df3.columns).toEqual(['type', 'size', 'weight', 'tel', 'cost']);
		expect(df3.column('weight').calc('sum')).toEqual(34);
	});

	test('Outer', function () {
		const df3 = lemuras.Table.merge(df1, df2, ['type', 'size'], 'outer');
		df3.rows.forEach(function (row) {
			expect(row.length).toEqual(df3.colcnt);
		});
		expect(df3.rowcnt).toEqual(cnt_inner+cnt_left+cnt_right);
		expect(df3.columns).toEqual(['type', 'size', 'weight', 'tel', 'cost']);
		expect(df3.column('weight').calc('sum')).toEqual(74);
	});
});