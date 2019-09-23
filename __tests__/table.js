
const m_data = require('../other/sample_data.js');
const lemuras = require('../lemuras/init.js');

describe('Table class', function () {
    let shift = 5;

    test('Basic', function () {
        expect(m_data.df1.colcnt).toEqual(m_data.cols.length);
        expect(m_data.df1.rowcnt).toEqual(m_data.rows.length);

        expect(function () {
            df2.column('random_name');
        }).toThrow(Error);
    });

    test('Loc linked', function () {
        let df2 = m_data.df1.copy();
        // Must be not separate
        let part = df2.loc(df2.column('size').isin([2,4]));
        expect(part.rowcnt).toEqual(3);
        part.row(0).set_value('size', part.row(0).get_value('size') + shift);
        // df2 must be changed
        expect(
            df2.column('size').calc('sum')
        ).toEqual(
            m_data.df1.column('size').calc('sum') + shift
        );
    });

    test('Loc separate', function () {
        let df2 = m_data.df1.copy();
        // A separate table
        let part = df2.loc(df2.column('size').isin([2,4]), true);
        expect(part.rowcnt).toEqual(3);
        part.row(0).set_value('size', part.row(0).get_value('size') + shift);
        // df2 must not be changed
        expect(
            df2.column('size').calc('sum')
        ).toEqual(
            m_data.df1.column('size').calc('sum')
        );
    });

    test('Loc error', function () {
        expect(function () {
            let ch = m_data.df1.column('size').isin([2,4]);
            ch.values = ch.values.slice(1);
            let part = m_data.df1.loc(ch);
        }).toThrow(TypeError);

        expect(function () {
            let ch = m_data.df1.column('size').isin([2,4]);
            let part = m_data.df1.loc(ch.values);
        }).toThrow(TypeError);
    });

    test('Index', function () {
        let df2 = m_data.df1.copy();
        df2.make_index('id');
        expect(df2.column('id').calc('sum')).toEqual(15);
    });

    test('Calc', function () {
        let res = m_data.df1.calc(row => {return row.get_value('size')*row.get_value('weight')});
        let check = m_data.df1.column('size').mul(m_data.df1.column('weight'));
        expect(res.calc('sum')).toEqual(check.calc('sum'));
    });

    test('Sort Iterate', function () {
        let df2 = m_data.df1.copy();
        df2.sort('weight');
        let last = df2.column('weight').calc('min');
        df2.forEach(function (row) {
            expect(last <= row.get_value('weight')).toBeTruthy();
            last = row.get_value('weight');
        });
        df2.sort('weight', false);
        last = df2.column('weight').calc('max');
        df2.forEach(function (row) {
            expect(last >= row.get_value('weight')).toBeTruthy();
            last = row.get_value('weight');
        });
    });

    test('Rename column', function () {
        let df2 = m_data.df1.copy();
        let initial_length = df2.colcnt;
        let old_name = 'size';
        let new_name = 'sz';
        df2.rename(old_name, new_name);
        expect(df2.column_indices[old_name]).toEqual(undefined);
        expect(df2.columns[df2.column_indices[new_name]]).toEqual(new_name);
    });

    test('Delete column', function () {
        let df2 = m_data.df1.copy();
        let deleted = 'size';
        let initial_length = df2.colcnt;
        df2.delete_column(deleted);
        expect(df2.column_indices[deleted]).toEqual(undefined);
        expect(df2.columns.length).toEqual(initial_length-1);
        expect(df2.row(0).length).toEqual(initial_length-1);
        expect(df2.row(-1).length).toEqual(initial_length-1);
    });

    test('Add column', function () {
        let df2 = m_data.df1.copy();
        let data = df2.column('weight').sub(df2.column('size'));
        df2.set_column('size', data);
        df2.set_column('size', data.values);
        data.values = data.values.slice(1);

        expect(function () {
            df2.set_column('size', data);
        }).toThrow(Error);

        expect(function () {
            df2.set_column('size', 'test,sample data');
        }).toThrow(Error);
    });

    test('From columns', function () {
        let columns = [
            m_data.df1.column('type'),
            m_data.df1.column('weight').add(m_data.df1.column('size').pow(2)),
        ];
        let title = 'Random test title';
        let df2 = lemuras.Table.from_columns(columns, title);
        expect(df2.rowcnt).toEqual(m_data.df1.rowcnt);
        expect(df2.colcnt).toEqual(columns.length);
        expect(df2.title).toEqual(title);
    });

    test('Find', function () {
        expect(
            m_data.df1.find({type:'B', weight:12}).get_value('tel')
        ).toEqual(84505505151);
        expect(
            m_data.df1.find({type:'A', weight:7})
        ).toEqual(null);

        let found = m_data.df1.find_all({type:'A', weight:12});
        expect(found.colcnt).toEqual(m_data.df1.colcnt);
        expect(found.rowcnt).toEqual(2);

        expect(function () {
            m_data.df1.find(16);
        }).toThrow(TypeError);

        expect(function () {
            m_data.df1.find({});
        }).toThrow(TypeError);

        expect(function () {
            m_data.df1.find({'fake': 5});
        }).toThrow(TypeError);
    });

    test('Delete row', function () {
        let df2 = m_data.df1.copy();
        df2.delete_row(0);
        df2.delete_row(-1);
        expect(df2.rowcnt+2).toEqual(m_data.df1.rowcnt);
        expect(df2.cell('size', 0)).toEqual(m_data.df1.cell('size', 1));
        expect(df2.cell('size', -1)).toEqual(m_data.df1.cell('size', -2));
    });

    test('Add row', function () {
        let df2 = m_data.df1.copy();

        expect(function () {
            df2.add_row('String');
        }).toThrow(TypeError);

        // Strict mode is on by default
        expect(function () {
            df2.add_row({});
        }).toThrow(Error);

        // No error must occur
        df2.add_row({}, false);

        expect(function () {
            df2.add_row([]);
        }).toThrow(Error);
    });

    test('Iter', function () {
        let total = 0;
        let df2 = m_data.df1.copy();
        df2.forEach(function (a) {
            df2.forEach(function (b) {
                total += a.get_value('size') * b.get_value('size');
            });
        });
        expect(total).toEqual(400);
    });
});