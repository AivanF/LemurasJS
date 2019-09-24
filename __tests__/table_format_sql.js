
const m_data = require('../other/sample_data.js');
const lemuras = require('../lemuras/init.js');

const sql_result = `+------+--------------+--------+--------+--------+
| id   | name         | q1     | q2     | q3     |
+------+--------------+--------+--------+--------+
| 1005 | ABC          |   3286 |   10.7 |     14 |
| 1006 | DEF          |    800 |   19.4 |     19 |
| 1010 | ghi          |   5140 |   18.1 |      3 |
| 2000 | gkl          |  18067 |  908.3 |  61933 |
| 2004 | mnp          |  47150 | 2151.5 | 170291 |
| 4046 | oqr          |   6856 |  176.6 |  12808 |
| 4048 | stu          |   1765 |  417.9 |   2385 |
| 4050 | vxyz         |   2158 | 1657.4 |  11725 |
+------+--------------+--------+--------+--------+`

describe('Table SQL', function () {
	test('Queries', function () {
		const q_create = m_data.df1.to_sql_create();
		const q_values = m_data.df1.to_sql_values();

		const df2 = lemuras.Table.from_sql_create(q_create);
		df2.add_sql_values(q_values);

		expect(df2.columns).toEqual(m_data.df1.columns);
		expect(df2.rowcnt).toEqual(m_data.df1.rowcnt);
		expect(df2.column('size').calc('sum')).toEqual(m_data.df1.column('size').calc('sum'));
		expect(df2.column('weight').calc('sum')).toEqual(m_data.df1.column('weight').calc('sum'));
	});

	test('Queries empty', function () {
		const df0 = new lemuras.Table(m_data.cols, [], 'Empty');
		const q_create = df0.to_sql_create();
		const q_values = df0.to_sql_values();

		const df2 = lemuras.Table.from_sql_create(q_create);
		df2.add_sql_values(q_values);

		expect(df2.columns).toEqual(m_data.cols);
		expect(df2.rowcnt).toEqual(0);
	});

	test('Load results', function () {
		const df2 = lemuras.Table.from_sql_result(sql_result);
		expect(df2.columns).toEqual(['id', 'name', 'q1', 'q2', 'q3']);
		expect(df2.rowcnt).toEqual(8);
		expect(df2.column('id').calc('sum')).toEqual(19169);
	});
});