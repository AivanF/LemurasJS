
const m_table = require('../lemuras/table.js');

const cols = ['type', 'size', 'weight', 'tel', 'when'];
const rows = [
	['A', 1, 12, '+79360360193', '1983-09-14'],
	['B', 4, 12, 84505505151, '13.08.2018'],
	['A', 3, 10, '31415926535', '2019-02-23 15:20'],
	['B', 6, 14, '', '2011/11/11'],
	['A', 4, 15, '23816326412', '25/03/95'],
	['A', 2, 12, null, null],
]
const df1 = new m_table.Table(cols, rows, 'Sample');

module.exports = {
	cols: cols,
	rows: rows,
	df1: df1,
};