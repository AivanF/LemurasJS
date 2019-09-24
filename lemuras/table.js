// https://github.com/AivanF/LemurasJS
var U = require('./utils');
var P = require('./processing');
var C = require('./column');
var R = require('./row');

var Table = function (columns, rows, title) {
    // TODO: check called with "new"
    if (!Array.isArray(columns)) {
        throw new TypeError('Table columns must be an array!');
    }
    if (!Array.isArray(rows)) {
        throw new TypeError('Table rows must be an array!');
    }
    this._columns = columns;
    this.rows = rows;
    this.title = title || 'NoTitle';
    this.types = null;
    this._calc_columns();
};

Table.prototype._calc_columns = function () {
    this.column_indices = {};
    for (var i = 0; i < this._columns.length; i++) {
        this.column_indices[this._columns[i]] = i;
    }
};

Object.defineProperty(Table.prototype, 'columns', {
    get: function () {
        return this._columns;
    },
    set: function (news) {
        if (this._columns.length != news.length) {
            throw new Error('New columns list must have the same length!');
        }
        this._columns = news;
        this._calc_columns();
    }
});

Object.defineProperty(Table.prototype, 'colcnt', {
    get: function () {
        return this._columns.length;
    }
});

Object.defineProperty(Table.prototype, 'rowcnt', {
    get: function () {
        return this.rows.length;
    }
});

Table.prototype.cell = function (column, row_index) {
    row_index = this._check_row(row_index);
    if (U.is_string(column)) {
        var ind = this.column_indices[column];
        if (U.is_undefined(ind)) {
            throw new TypeError('Column {} does not exist!'.format(column));
        }
        column = ind;
    }
    return this.rows[row_index][column];
};

Table.prototype.set_cell = function (column, row_index, value) {
    row_index = this._check_row(row_index);
    if (U.is_string(column)) {
        column = this.column_indices[column];
    }
    this.rows[row_index][column] = value;
};

Table.prototype.column = function (column) {
    if (U.is_string(column)) {
        if (!U.is_undefined(this.column_indices[column])) {
            column = this.column_indices[column];
        }
    }
    if (!U.is_int(column)) {
        throw new TypeError('Column {} does not exist!'.format(column));
    }
    return new C.Column(null, this._columns[column], this, this._columns[column]);
};

Table.prototype.set_column = function (column, data) {
    if (this.rowcnt != data.length) {
        throw new Error('Table.set_column data length ({}) must be equal to table rows count ({})'.format(data.length, this.rowcnt));
    }
    var ind = this.column_indices[column];
    if (U.is_undefined(ind)) {
        this.add_column(data, column);
        return;
    }
    if (data instanceof C.Column) {
        for (var i = this.rowcnt - 1; i >= 0; i--) {
            this.rows[i][ind] = data.get_value(i);
        }
    } else {
        for (var i = this.rowcnt - 1; i >= 0; i--) {
            this.rows[i][ind] = data[i];
        }
    }
    this._calc_columns();
};

Table.prototype.add_column = function (data, title) {
    if (!title) {
        if (data instanceof C.Column) {
            title = data.title;
        }
        title = 'c' + this.colcnt;
    }
    if (this.rowcnt == 0 && this.colcnt == 0) {
        if (data instanceof C.Column) {
            for (var i = data.rowcnt - 1; i >= 0; i--) {
                this.rows.push([data.get_value(i)]);
            }
        } else if (Array.isArray(data)) {
            for (var i = data.length - 1; i >= 0; i--) {
                this.rows.push([data[i]]);
            }
        } else {
            throw new TypeError('Table.add_column must be either an array or Column object! Got {}'.format(data));
        }
    } else {
        if (this.rowcnt != data.length) {
            throw new Error('Table.add_column data length ({}) must be equal to table rows count ({})'.format(data.length, this.rowcnt));
        }
        if (data instanceof C.Column) {
            for (var i = this.rowcnt - 1; i >= 0; i--) {
                this.rows[i].push(data.get_value(i));
            }
        } else if (Array.isArray(data)) {
            for (var i = this.rowcnt - 1; i >= 0; i--) {
                this.rows[i].push(data[i]);
            }
        } else {
            throw new TypeError('Table.add_column must be either an array or Column object! Got {}'.format(data));
        }
    }
    this.column_indices[title] = this.colcnt;
    this._columns.push(title);
};

Table.prototype.delete_column = function (column) {
    var ind = U.is_string(column) ? this.column_indices[column] : column;
    this._columns.splice(ind, 1);
    for (var i = this.rowcnt - 1; i >= 0; i--) {
        this.rows[i].splice(ind, 1);
    }
    this._calc_columns();
};

Table.prototype.rename = function (oldname, newname) {
    if (this.column_indices[oldname]) {
        if (oldname != newname) {
            this._columns[this.column_indices[oldname]] = newname;
            this.column_indices[newname] = this.column_indices[oldname];
            this.column_indices[oldname] = undefined;
        }
    }
};

Table.from_columns = function (columns, title) {
    var res = new Table([], [], title || 'From columns');
    if (Array.isArray(columns)) {
        for (var i = 0; i < columns.length; i++) {
            res.add_column(columns[i], null);
        }
    } else {
        for (var key in columns) {
            res.add_column(columns[key], key);
        }
    }
    return res;
};

Table.from_rows = function (rows, columns, title, preprocess) {
    if (!columns) {
        if (rows.length > 0) {
            columns = [];
            for (var i = 0; i < rows[0].length; i++) {
                columns.push('c' + i);
            }
        } else {
            columns = [];
        }
    }
    var res = new Table(columns, [], title || 'From rows');
    for (var i = 0; i < rows.length; i++) {
        res.add_row(rows, undefined, preprocess);
    }
    return res;
};

Table.prototype._check_row = function (row_index) {
    if (U.is_undefined(row_index)) {
        return 0;
    }
    if (row_index < 0) {
        row_index += this.rowcnt;
    }
    if (!U.is_int(row_index) || row_index < 0 || row_index >= this.rowcnt) {
        throw new TypeError('Bad row index!');
    }
    return row_index;
};

Table.prototype.row = function (row_index) {
    return new R.Row(this, this._check_row(row_index));
};

Table.prototype.row_named = function (row_index) {
    var res = {};
    for (var i = 0; i < this.colcnt; i++) {
        res[this._columns[i]] = this.rows[row_index][i];
    }
    return res;
};

Table.prototype.add_row = function (data, strict, preprocess) {
    if (U.is_undefined(strict)) { strict = true; }
    var row = [];
    if (data instanceof R.Row) {
        if (this.colcnt != data.colcnt) {
            throw new Error('Table.add_row Row argument must have length equal to columns count!');
        }
        for (var i = 0; i < this.colcnt; i++) {
            row.push(preprocess ? P.parse_value(data.get_value(i)) : data.get_value(i));
        }
    } else if (Array.isArray(data)) {
        if (this.colcnt != data.length) {
            throw new Error('Table.add_row array argument must have length equal to columns count!');
        }
        for (var i = 0; i < this.colcnt; i++) {
            row.push(preprocess ? P.parse_value(data[i]) : data[i]);
        }
    } else if (U.is_dict(data)) {
        var key;
        for (var i = 0; i < this.colcnt; i++) {
            key = this._columns[i];
            if (!data[key]) {
                if (strict) {
                    throw new Error('Table.add_row dict argument does not have key ' + key + '!')
                } else {
                    row.push(undefined);
                }
            } else {
                row.push(preprocess ? P.parse_value(data[key]) : data[key]);
            }
        }
    } else {
        throw new TypeError('Table.add_row argument must be either Row, array or dict!')
    }
    this.rows.push(row);
};

Table.prototype.delete_row = function (row_index) {
    this.rows.splice(this._check_row(row_index), 1);
};

Table.prototype.find_types = function (row_index) {
    var rows = [];
    var key, t;
    for (var i = 0; i < this.colcnt; i++) {
        key = this._columns[i];
        t = this.column(key).get_type()
        rows.push([key, t.type, t.length]);
    }
    this.types = new Table(['Column', 'Type', 'Symbols'], rows, 'Types');
    return this.types;
};

Table.prototype.append = function (other) {
    for (var i = 0; i < this.rowcnt; i++) {
        this.add_row(other.row_named());
    }
};

Table.concat = function (tables) {
    var res = tables[0].copy();
    for (var i = 1; i < tables.length; i++) {
        res.append(tables[i]);
    }
    res.title = 'Concat';
    return res;
};

Table.prototype.make_index = function (title) {
    var res = C.Column.make_index(this.rowcnt);
    if (title) {
        this.add_column(res, title);
    }
    return res;
};

Table.prototype.calc = function (task, abc) {
    var res = [];
    var row = new R.Row(this, 0);
    var args = [row];
    args = args.concat( U.args2array(arguments).slice(1) );
    for (var i = 0; i < this.rowcnt; i++) {
        row.row_index = i;
        res.push(task.apply(null, args));
    }
    return new C.Column(res, 'Calc');
};

Table.prototype.loc = function (prism, separate) {
    if (!(prism instanceof C.Column)) {
        throw new TypeError('Table.loc takes one Column argument');
    }
    if (prism.length != this.rowcnt) {
        throw new TypeError('Table.loc argument length must be the same');
    }
    var res = [];
    var checker;
    for (var i = 0; i < this.rowcnt; i++) {
        checker = prism.get_value(i);
        if (checker) {
            if (separate) {
                res.push(this.rows[i].slice());
            } else {
                res.push(this.rows[i]);
            }
        }
    }
    var title = 'Filtered {}'.format(this.title);
    var columns;
    if (separate) {
        title += ' Copy';
        columns = this._columns;
    } else {
        columns = this._columns.slice();
    }
    return new Table(columns, res, title);
};

function comparify(v1, v2, inv) {
    if (inv) {
        var tmp = v2;
        v2 = v1;
        v1 = tmp;
    }
    if (v1 < v2) {
        return -1;
    } else if (v1 > v2) {
        return 1;
    } else {
        return 0;
    }
}

Table.prototype.sort = function (columns, asc) {
    if (!Array.isArray(columns)) {
        columns = [columns];
    }
    if (U.is_undefined(asc)) {
        asc = true;
    }
    var key, order;
    for (var i = columns.length-1; i >= 0; i--) {
        key = columns[i];
        if (U.is_string(key)) {
            key = this.column_indices[key];
        }
        if (Array.isArray(asc)) {
            order = asc[i];
        } else {
            order = asc;
        }
        this.rows.sort(function (row1, row2) {
            return comparify(row1[key], row2[key], !order);
        });
    }
};

Table.prototype.groupby = function (key_columns) {
    if (!key_columns) {
        key_columns = [];
    }
    if (!Array.isArray(key_columns)) {
        key_columns = [key_columns];
    }
    for (var i = 0; i < key_columns.length; i++) {
        if (U.is_undefined(this.column_indices[key_columns[i]])) {
            throw new Error('GroupBy arg "{}" is not a Table column name!'.format(key_columns[i]));
        }
    }
    var m_grouped = require('./grouped');
    var res = new m_grouped.Grouped(key_columns, this._columns, this.column_indices, this.title);
    this.forEach(function (row) {
        res.add(row);
    });
    return res;
};

Table.prototype.pivot = function (newcol, newrow, newval, empty, task) {
    if (U.is_undefined(empty)) {
        empty = null;
    }
    if (U.is_undefined(task)) {
        task = 'first';
    }
    var indcol = this.column_indices[newcol];
    var indrow = this.column_indices[newrow];
    var indval = this.column_indices[newval];
    var colsels = [];
    var rowsels = [];
    // Dictionary with columns->rows->values
    var values = {};

    // Fill the dictionary
    var row, curcol, currow, curval;
    for (var i = 0; i < this.rowcnt; i++) {
        row = this.rows[i];
        curcol = '' + row[indcol];
        currow = '' + row[indrow];
        curval = row[indval];
        if (colsels.indexOf(curcol) < 0) {
            colsels.push(curcol);
        }
        if (rowsels.indexOf(currow) < 0) {
            rowsels.push(currow);
        }
        if (U.is_undefined(values[curcol])) {
            values[curcol] = {};
        }
        if (U.is_undefined(values[curcol][currow])) {
            values[curcol][currow] = new C.Column([]);
        }
        values[curcol][currow].values.push(curval);
    }

    // Create plain rows
    colsels = colsels.sort();
    rowsels = rowsels.sort();
    var rows = [];
    var row;
    for (var i = 0; i < rowsels.length; i++) {
        currow = rowsels[i];
        row = [currow];
        for (var j = 0; j < colsels.length; j++) {
            curcol = colsels[j];
            if (U.is_undefined(values[curcol][currow])) {
                row.push(empty);
            } else {
                row.push(values[curcol][currow].calc(task));
            }
        }
        rows.push(row);
    }
    return new Table([newrow].concat(colsels), rows, 'Pivot of {}'.format(this.title))
};

Table.merge = function (tl, tr, keys, how, empty) {
    if (U.is_undefined(how)) {
        how = 'inner';
    }
    if (U.is_undefined(empty)) {
        empty = null;
    }
    var doleft = (how == 'left') || (how == 'outer');
    var doright = (how == 'right') || (how == 'outer');
    if (!Array.isArray(keys)) {
        keys = [keys];
    }
    var rescol = [];
    var resrow = [];
    var i, j, tokey;

    // Key index to left keys
    var key2leftcol = U.arrayCreate(keys.length, 0);
    // TODO: simplify with column_indices
    for (i = 0; i < tl.colcnt; i++) {
        for (j = 0; j < keys.length; j++) {
            if (tl.columns[i] == keys[j]) {
                key2leftcol[j] == i;
            }
        }
        rescol.push(tl.columns[i]);
    }

    // Right keys to key index
    var rightcol2key = [];
    // TODO: simplify with column_indices
    for (i = 0; i < tr.colcnt; i++) {
        tokey = null;
        for (j = 0; j < keys.length; j++) {
            if (tr.columns[i] == keys[j]) {
                tokey = j;
                break;
            }
        }
        if (tokey == null) {
            rescol.push(tr.columns[i]);
        }
        rightcol2key.push(tokey);
    }

    var usedrowsleft = U.arrayCreate(tl.rowcnt, false);
    var usedrowsright = U.arrayCreate(tr.rowcnt, false);
    var row_index, r2_index, rl, rr, match, row, column_index;

    for (row_index = 0; row_index < tl.rowcnt; row_index++) {
        rl = tl.rows[row_index];
        for (r2_index = 0; r2_index < tr.rowcnt; r2_index++) {
            rr = tr.rows[r2_index];
            match = true;
            // Check all keys are the same
            for (i = 0; i < keys.length; i++) {
                if (rl[tl.column_indices[keys[i]]] != rr[tr.column_indices[keys[i]]]) {
                    match = false;
                    break;
                }
            }

            if (match) {
                // Mark the matched rows
                // so they won't be used in left / right / outer
                usedrowsleft[row_index] = true;
                usedrowsright[r2_index] = true;

                row = [];
                // Add all the left side
                for (i = 0; i < rl.length; i++) {
                    row.push(rl[i]);
                }
                // Add right side if not keys
                // they are already in left side
                for (column_index = 0; column_index < tr.colcnt; column_index++) {
                    if (rightcol2key[column_index] == null) {
                        row.push(rr[column_index]);
                    }
                }
                resrow.push(row);
            }
        }
    }

    if (doleft) {
        for (row_index = 0; row_index < tl.rowcnt; row_index++) {
            // Add the row if it wasn't used in inner
            if (!usedrowsleft[row_index]) {
                row = [];
                // Fill left side with values
                rl = tl.rows[row_index];
                for (i = 0; i < rl.length; i++) {
                    row.push(rl[i]);
                }
                // Fill right side with empty
                for (column_index = 0; column_index < tr.colcnt; column_index++) {
                    // Key are already in the left side
                    if (rightcol2key[column_index] == null) {
                        // If not a key, just add the value
                        row.push(empty);
                    }
                }
                resrow.push(row);
            }
        }
    }

    if (doright) {
        for (row_index = 0; row_index < tr.rowcnt; row_index++) {
            // Add the row if it wasn't used in inner
            if (!usedrowsright[row_index]) {
                row = [];
                // Fill left side with empty
                for (column_index = 0; column_index < tl.colcnt; column_index++) {
                    row.push(empty);
                }
                rr = tr.rows[row_index];
                // Fill right side with values
                for (column_index = 0; column_index < tr.colcnt; column_index++) {
                    if (rightcol2key[column_index] == null) {
                        // If not a key, just add the value
                        row.push(rr[column_index]);
                    } else {
                        // If a key, put it in the left side
                        row[rightcol2key[column_index]] = rr[column_index];
                    }
                }
                resrow.push(row);
            }
        }
    }

    var title = 'Merged {} {} & {}'.format(how, tl.title, tr.title);
    return new Table(rescol, resrow, title);
};

Table.prototype.folds = function (fold_count, start) {
    if (U.is_undefined(start)) {
        start = 0;
    }
    throw new Error('Not implemented!');
};

Table.from_csv = function (data, empty, preprocess, title, delimiter, quotechar) {
    if (U.is_undefined(preprocess)) {
        preprocess = true;
    }
    if (U.is_undefined(title)) {
        title = 'from CSV';
    }
    if (U.is_undefined(delimiter)) {
        delimiter = ',';
    }
    if (U.is_undefined(quotechar)) {
        quotechar = '"';
    }
    throw new Error('Not implemented!');
};

Table.prototype.to_csv = function (delimiter, quotechar) {
    if (U.is_undefined(delimiter)) {
        delimiter = ',';
    }
    if (U.is_undefined(quotechar)) {
        quotechar = '"';
    }
    throw new Error('Not implemented!');
};

Table.prototype.to_sql_create = function () {
    throw new Error('Not implemented!');
};

Table.prototype.to_sql_values = function () {
    throw new Error('Not implemented!');
};

Table.from_sql_create = function (data) {
    throw new Error('Not implemented!');
};

Table.from_sql_result = function (data, empty, preprocess, title) {
    if (U.is_undefined(preprocess)) {
        preprocess = true;
    }
    if (U.is_undefined(title)) {
        title = 'from SQL res';
    }
    if (U.is_undefined(empty)) {
        empty = null;
    }
    throw new Error('Not implemented!');
};

Table.prototype.add_sql_values = function (data, empty) {
    if (U.is_undefined(empty)) {
        empty = null;
    }
    throw new Error('Not implemented!');
};

Table.from_json = function (data, preprocess, title) {
    if (U.is_undefined(preprocess)) {
        preprocess = true;
    }
    if (U.is_undefined(title)) {
        title = 'from JSON';
    }
    throw new Error('Not implemented!');
};

Table.prototype.to_json = function (as_dict, pretty) {
    if (U.is_undefined(as_dict)) {
        as_dict = false;
    }
    if (U.is_undefined(pretty)) {
        pretty = false;
    }
    throw new Error('Not implemented!');
};

Table.from_html = function (data, title) {
    if (U.is_undefined(title)) {
        title = 'from HTML';
    }
    throw new Error('Not implemented!');
};

Table.prototype._check_query = function (query) {
    if (!U.is_dict(query)) {
        throw new TypeError('Query must be a dictionary!');
    }
    if (Object.keys(query).length < 1) {
        throw new TypeError('Query must have at least one key!');
    }
    for (var key in query) {
        if (U.is_undefined(this.column_indices[key])) {
            throw new TypeError('Some query key is not a column name!');
        }
    }
};

Table.prototype.find = function (query) {
    this._check_query(query);
    var well;
    for (var i = 0; i < this.rowcnt; i++) {
        well = true;
        for (var key in query) {
            if (this.cell(key, i) != query[key]) {
                well = false;
                break;
            }
        }
        if (well) {
            return this.row(i);
        }
    }
    return null;
};

Table.prototype.find_all = function (query) {
    this._check_query(query);
    var checker = C.Column.make(this.rowcnt, true);
    for (var key in query) {
        checker = checker.and(this.column(key).eq(query[key]));
    }
    return this.loc(checker);
};

Object.defineProperty(Table.prototype, 'length', {
    get: function () {
        return this.rowcnt;
    }
});

Table.prototype.forEach = function (callback) {
    // callback = function (row, index)
    var row = new R.Row(this, 0);
    for (var i = 0; i < this.rowcnt; i++) {
        row.row_index = i;
        callback(row, i);
    }
};

Table.prototype.copy = function () {
    var columns = this._columns.slice();
    var rows = [];
    for (var i = 0; i < this.rowcnt; i++) {
        rows.push(this.rows[i].slice());
    }
    return new Table(columns, rows, this.title);
};

Table.minshowrows = 4;
Table.maxshowrows = 7;
Table.minshowcols = 6;
Table.maxshowcols = 8;

Table.prototype.__need_cut__ = function (cut) {
    if (U.is_undefined(cut)) {
        cut = true;
    }
    var res = {
        showrowscnt: Table.minshowrows,
        showcolscnt: Table.minshowcols,
        hiddenrows: true,
        hiddencols: true,
    }
    if (!cut || this.rowcnt <= Table.maxshowrows) {
        res.showrowscnt = this.rowcnt;
        res.hiddenrows = false;
    }
    if (!cut || this.colcnt <= Table.maxshowcols) {
        res.showcolscnt = this.colcnt;
        res.hiddencols = false;
    }
    return res;
};

Table.prototype.to_html = function (cut) {
    var ctrl = this.__need_cut__(cut);
    throw new Error('Not implemented!');
};

Table.prototype.toString = function (cut) {
    var ctrl = this.__need_cut__(cut);
    var res = '- Table object, title: "{}", {} columns, {} rows.\n'.format(
        this.title, this.colcnt, this.rowcnt
    );
    res += this._columns
        .slice(0, ctrl.showcolscnt)
        .map(U.partial(U.repr_cell, [undefined, true]))
        .join(' ');
    if (ctrl.hiddencols) {
        res += ' ...';
    }
    for (var i = 0; i < ctrl.showrowscnt; i++) {
        var row = this.rows[i];
        res += '\n' + row
            .slice(0, ctrl.showcolscnt)
            .map(U.partial(U.repr_cell, [undefined, true]))
            .join(' ');
    }
    if (ctrl.hiddenrows) {
        res += '\n. . .';
    }
    return res;
};


module.exports = {
    Table: Table,
};