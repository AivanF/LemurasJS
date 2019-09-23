
const m_data = require('../other/sample_data.js');
const lemuras = require('../lemuras/init.js');

describe('Row class', function () {
    test('Creation', function () {
        // Row constructor arguments:
        // table, row_index, values, columns
        var df2 = m_data.df1.copy();

        // Must pass without errors
        df2.row(0);
        df2.row(-df2.rowcnt);

        expect(function () {
            df2.row(-df2.rowcnt-1);
        }).toThrow(TypeError);

        expect(function () {
            df2.row(df2.rowcnt);
        }).toThrow(TypeError);

        expect(function () {
            df2.row('lol');
        }).toThrow(TypeError);
    });

    test('Basic', function () {
        expect(function () {
            df2.row(0).get_value('lol');
        }).toThrow(TypeError);

        var df2 = m_data.df1.copy();
        var row = df2.row(1);
        expect(row.colcnt).toEqual(df2.colcnt);
        expect(row.columns).toEqual(df2.columns);
        expect(row.get_type()['type']).toEqual('m');

        expect(function () {
            row.calc('random_name');
        }).toThrow(Error);
    });

    test('Linked', function () {
        // Changing value of linked row
        var change = 5;
        var df2 = m_data.df1.copy();
        var was = df2.column('size').calc('sum');
        var r = df2.row(0);
        r.set_value('size', r.get_value('size') + change);
        expect(df2.column('size').calc('sum')).toEqual(was + change);
    });

    test('Separated', function () {
        // Changing value of separated row
        var change = 5;
        var df2 = m_data.df1.copy();
        var was = df2.column('size').calc('sum');
        var r = df2.row(0).copy();
        r.set_value('size', r.get_value('size'));
        expect(df2.column('size').calc('sum')).toEqual(was);
    });

    test('Iter', function () {
        var res = [];
        var r = new lemuras.Row(null, null, [2, 3]);
        r.forEach(function (a, i) {
            r.forEach(function (b, j) {
                res.push(a*b);
            });
        });
        expect(lemuras.processing.aggfuns.sum(res)).toEqual(25);
    });
});