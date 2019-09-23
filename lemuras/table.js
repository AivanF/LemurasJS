// https://github.com/AivanF/LemurasJS
var m_utils = require('./utils');
var m_processing = require('./processing');
var m_column = require('./column');
var m_row = require('./row');

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
    if (m_utils.is_string(column)) {
        var ind = this.column_indices[column];
        if (m_utils.is_undefined(ind)) {
            throw new TypeError('Column {} does not exist!'.format(column));
        }
        column = ind;
    }
    return this.rows[row_index][column];
};

Table.prototype.set_cell = function (column, row_index, value) {
    row_index = this._check_row(row_index);
    if (m_utils.is_string(column)) {
        column = this.column_indices[column];
    }
    this.rows[row_index][column] = value;
};

Table.prototype.column = function (column) {
    if (m_utils.is_string(column)) {
        if (!m_utils.is_undefined(this.column_indices[column])) {
            column = this.column_indices[column];
        }
    }
    if (!m_utils.is_int(column)) {
        throw new TypeError('Column {} does not exist!'.format(column));
    }
    return new m_column.Column(null, this._columns[column], this, this._columns[column]);
};

Table.prototype.set_column = function (column, data) {
    if (this.rowcnt != data.length) {
        throw new Error('Table.set_column data length ({}) must be equal to table rows count ({})'.format(data.length, this.rowcnt));
    }
    var ind = this.column_indices[column];
    if (m_utils.is_undefined(ind)) {
        this.add_column(data, column);
        return;
    }
    if (data instanceof m_column.Column) {
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
        if (data instanceof m_column.Column) {
            title = data.title;
        }
        title = 'c' + this.colcnt;
    }
    if (this.rowcnt == 0 && this.colcnt == 0) {
        if (data instanceof m_column.Column) {
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
        if (data instanceof m_column.Column) {
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
    var ind = m_utils.is_string(column) ? this.column_indices[column] : column;
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
    if (m_utils.is_undefined(row_index)) {
        return 0;
    }
    if (row_index < 0) {
        row_index += this.rowcnt;
    }
    if (!m_utils.is_int(row_index) || row_index < 0 || row_index >= this.rowcnt) {
        throw new TypeError('Bad row index!');
    }
    return row_index;
};

Table.prototype.row = function (row_index) {
    return new m_row.Row(this, this._check_row(row_index));
};

Table.prototype.row_named = function (row_index) {
    var res = {};
    for (var i = 0; i < this.colcnt; i++) {
        res[this._columns[i]] = this.rows[row_index][i];
    }
    return res;
};

Table.prototype.add_row = function (data, strict, preprocess) {
    if (m_utils.is_undefined(strict)) { strict = true; }
    var row = [];
    if (data instanceof m_row.Row) {
        if (this.colcnt != data.colcnt) {
            throw new Error('Table.add_row Row argument must have length equal to columns count!');
        }
        for (var i = 0; i < this.colcnt; i++) {
            row.push(preprocess ? m_processing.parse_value(data.get_value(i)) : data.get_value(i));
        }
    } else if (Array.isArray(data)) {
        if (this.colcnt != data.length) {
            throw new Error('Table.add_row array argument must have length equal to columns count!');
        }
        for (var i = 0; i < this.colcnt; i++) {
            row.push(preprocess ? m_processing.parse_value(data[i]) : data[i]);
        }
    } else if (m_utils.is_dict(data)) {
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
                row.push(preprocess ? m_processing.parse_value(data[key]) : data[key]);
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
    var res = m_column.Column.make_index(this.rowcnt);
    if (title) {
        this.add_column(res, title);
    }
    return res;
};

Table.prototype.calc = function (task, abc) {
    var res = [];
    var row = new m_row.Row(this, 0);
    var args = [row];
    args = args.concat( m_utils.args2array(arguments).slice(1) );
    for (var i = 0; i < this.rowcnt; i++) {
        row.row_index = i;
        res.push(task.apply(null, args));
    }
    return new m_column.Column(res, 'Calc');
};

Table.prototype.loc = function (prism, separate) {
    if (!(prism instanceof m_column.Column)) {
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
    if (m_utils.is_undefined(asc)) {
        asc = true;
    }
    var key, order;
    for (var i = columns.length-1; i >= 0; i--) {
        key = columns[i];
        if (m_utils.is_string(key)) {
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
        if (m_utils.is_undefined(this.column_indices[key_columns[i]])) {
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
    if (m_utils.is_undefined(empty)) {
        empty = null;
    }
    if (m_utils.is_undefined(task)) {
        task = 'first';
    }
    throw new Error('Not implemented!');
};

Table.merge = function (tl, tr, keys, how, empty) {
    if (m_utils.is_undefined(how)) {
        how = 'inner';
    }
    if (m_utils.is_undefined(empty)) {
        empty = null;
    }
    throw new Error('Not implemented!');
};

Table.prototype._check_query = function (query) {
    if (!m_utils.is_dict(query)) {
        throw new TypeError('Query must be a dictionary!');
    }
    if (Object.keys(query).length < 1) {
        throw new TypeError('Query must have at least one key!');
    }
    for (var key in query) {
        if (m_utils.is_undefined(this.column_indices[key])) {
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
    var checker = m_column.Column.make(this.rowcnt, true);
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
    var row = new m_row.Row(this, 0);
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

Table.prototype.toString = function () {
    throw new Error('Not implemented!');
};


module.exports = {
    Table: Table,
};