
const m_data = require('../other/sample_data.js');
const lemuras = require('../lemuras/init.js');

let agg_rule = {
	size: {
		Count: 'count',
		Value: (x) => {return lemuras.processing.aggfuns.sum(x)*3},
		Any: 'last'
	}
};

describe('Table GroupBy', function () {
	let df1 = new lemuras.Table(m_data.cols, m_data.rows);
	let gr = df1.groupby(['type', 'weight']);

	test('Bade key column', function () {
		expect(function () {
			df1.groupby('typo');
		}).toThrow(Error);
	});

	test('Groups', function () {
		let dfc = gr.counts();
		expect(dfc.rowcnt).toEqual(5);
		expect(dfc.columns).toEqual(['type', 'weight', 'rows']);
		expect(dfc.column('weight').calc('sum')).toEqual(63);
		expect(dfc.column('rows').calc('sum')).toEqual(6);
	});

	test('Split', function () {
		let gr = df1.groupby('type');
		let dfc = gr.counts();
		let res = null;

		res = gr.split(false, true);
		expect(res.length).toEqual(dfc.rowcnt);
		for (var i = 0; i < res.length; i++) {
			var keys = res[i][0];
			var tbl = res[i][1];
			expect(tbl.colcnt).toEqual(df1.colcnt-1);
			// TODO: uncomment when .find will be implemented
			// expect(tbl.rowcnt).toEqual(dfc.find(keys).get_value('rows'));
		}

		res = gr.split(true, true);
		expect(res.length).toEqual(dfc.rowcnt);
		for (var i = 0; i < res.length; i++) {
			var keys = res[i][0];
			var tbl = res[i][1];
			expect(tbl.colcnt).toEqual(df1.colcnt);
			// TODO: uncomment when .find will be implemented
			// expect(tbl.rowcnt).toEqual(dfc.find(keys).get_value('rows'));
		}
	});

	test('Agg main', function () {
		let df2 = gr.agg(agg_rule);
		expect(df2.columns).toEqual(
			['type', 'weight', 'Count', 'Value', 'Any']
		);
		expect(df2.rowcnt).toEqual(5);
		expect(df2.column('weight').calc('sum')).toEqual(63);
		expect(df2.column('Count').calc('sum')).toEqual(6);
		expect(df2.column('Value').calc('sum')).toEqual(60);
	});

	test('Agg default', function () {
		let df2 = gr.agg({}, 'first');
		expect(
			df2.columns.slice().sort()
		).toEqual(
			df1.columns.slice().sort()
		);
		expect(df2.rowcnt).toEqual(5);

		// Default functions in a list must be string names
		expect(function () {
			let x = gr.agg({}, [lemuras.processing.aggfuns.min]);
		}).toThrow(TypeError);

		// Aggregation function must be a function
		expect(function () {
			let x = gr.agg({}, {some:{pi:3.14}});
		}).toThrow(TypeError);
	});

	test('By one', function () {
		let gr = df1.groupby('type');
		let df2 = gr.agg(agg_rule);
		expect(
			df2.columns.slice().sort()
		).toEqual(
			['type', 'Count', 'Value', 'Any'].sort()
		);
		expect(df2.rowcnt).toEqual(df1.column('type').calc('nunique'));
		expect(df2.column('Count').calc('avg')).toEqual(df1.rowcnt/df2.rowcnt);
	});

	test('By all', function () {
		let grall = df1.groupby();
		let df2 = grall.agg(agg_rule);
		expect(
			df2.columns.slice().sort()
		).toEqual(
			['Count', 'Value', 'Any'].sort()
		);
		expect(df2.rowcnt).toEqual(1);
		expect(df2.cell('Count')).toEqual(6);
		expect(df2.cell('Value')).toEqual(60);
	});
});