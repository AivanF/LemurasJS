
const lemuras = require('../lemuras/init.js');

const cols1 = ['x', 'y', 'val'];
const rows1 = [
	[0, 'c', 3],
	[2, 'b', 7],
	[1, 'a', 2],
	[4, 'c', 2],
];
const df1 = new lemuras.Table(cols1, rows1);

const cols2 = ['x', 'y', 'val'];
const rows2 = [
	[1, 'a', 3],
	[0, 'c', 3],
	[2, 'b', 7],
	[0, 'c', 1],
	[1, 'a', 2],
	[4, 'c', 2],
];
const df2 = new lemuras.Table(cols2, rows2);

describe('Table Pivot', function () {
	test('Main', function () {
		const res = df1.pivot('x', 'y', 'val', 0);
		expect(res.colcnt).toEqual(df1.column('x').calc('nunique')+1);
		expect(res.rowcnt).toEqual(df1.column('y').calc('nunique'));
		expect(
			res.loc(res.column('y').eq('c')).row().calc('sum')
		).toEqual(
			df1.loc(df1.column('y').eq('c')).column('val').calc('sum')
		);
		expect(res.find_types().find({'Column':'y'}).get_value('Type')).toEqual('s');
	});

	test('Task sum', function () {
		const res = df2.pivot('x', 'y', 'val', 0, 'sum');
		expect(res.find({'y':'a'}).calc('sum')).toEqual(5);
		expect(res.find({'y':'b'}).calc('sum')).toEqual(7);
		expect(res.find({'y':'c'}).calc('sum')).toEqual(6);
	});

	test('Task min', function () {
		const res = df2.pivot('x', 'y', 'val', 0, 'min');
		expect(res.find({'y':'a'}).calc('sum')).toEqual(2);
		expect(res.find({'y':'b'}).calc('sum')).toEqual(7);
		expect(res.find({'y':'c'}).calc('sum')).toEqual(3);
	});

	test('Task count', function () {
		const res = df2.pivot('x', 'y', 'val', 0, 'count');
		res.set_column('sums', res.calc(function (row) {
			return row.calc('sum');
		}));
		expect(res.column('sums').calc('sum')).toEqual(df2.rowcnt);
	});
});