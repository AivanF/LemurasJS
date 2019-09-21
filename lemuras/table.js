// https://github.com/AivanF/LemurasJS
var m_utils = require('./utils');
var m_processing = require('./processing');
var m_column = require('./column');
var m_row = require('./row');

var Table = function (columns, rows, title) {
    // TODO: check called with "new"
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
            throw Error('New columns list must have the same length!');
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
    if (m_utils.is_string(column)) {
        column = this.column_indices[column];
    }
    return this.rows[row_index][column];
};

Table.prototype.set_cell = function (column, row_index, value) {
    if (m_utils.is_string(column)) {
        column = this.column_indices[column];
    }
    this.rows[row_index][column] = value;
};

Table.prototype.column = function (column) {
    if (m_utils.is_string(column)) {
        column = this.column_indices[column];
    } else if (!m_utils.is_int(column)) {
        throw Error('Bad column key ' + column);
    }
    return new m_column.Column(null, this._columns[column], this, this._columns[column]);
};

Table.prototype.set_column = function (column, data) {
    if (this.rowcnt != data.length) {
        throw Error('Table.set_column data length ({}) must be equal to table rows count ({})'.format(data.length, this.rowcnt));
    }
    var ind = this.column_indices[column];
    if (m_utils.is_undefined(ind)) {
        throw Error('Table.set_column "{}" does not exist!'.format(column));
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
            for (var i = this.rowcnt - 1; i >= 0; i--) {
                this.rows.push([data.get_value(i)]);
            }
        } else {
            for (var i = this.rowcnt - 1; i >= 0; i--) {
                this.rows.push([data[i]]);
            }
        }
    } else {
        if (this.rowcnt != data.length) {
            throw Error('Table.add_column data length ({}) must be equal to table rows count ({})'.format(data.length, this.rowcnt));
        }
        if (data instanceof m_column.Column) {
            for (var i = this.rowcnt - 1; i >= 0; i--) {
                this.rows[i].push(data.get_value(i));
            }
        } else {
            for (var i = this.rowcnt - 1; i >= 0; i--) {
                this.rows[i].push(data[i]);
            }
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
            this.add_column(null, columns[i]);
        }
    } else {
        for (var key in columns) {
            this.add_column(key, columns[key]);
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

Table.prototype.row = function (row_index) {
    return new m_row.Row(this, row_index);
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
            throw Error('Table.add_row Row argument must have length equal to columns count!');
        }
        for (var i = 0; i < this.colcnt; i++) {
            row.push(preprocess ? m_processing.parse_value(data.get_value(i)) : data.get_value(i));
        }
    } else if (Array.isArray(data)) {
        if (this.colcnt != data.length) {
            throw Error('Table.add_row array argument must have length equal to columns count!');
        }
        for (var i = 0; i < this.colcnt; i++) {
            row.push(preprocess ? m_processing.parse_value(data[i]) : data[i]);
        }
    } else {
        var key;
        for (var i = 0; i < this.colcnt; i++) {
            key = this._columns[i];
            if (!data[key]) {
                if (strict) {
                    throw Error('Table.add_row dict argument does not have key ' + key + '!')
                } else {
                    row.push(undefined);
                }
            } else {
                row.push(preprocess ? m_processing.parse_value(data[key]) : data[key]);
            }
        }
    }
    this.rows.push(row);
};

Table.prototype.delete_row = function (row_index) {
    this.rows.splice(row_index, 1);
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

Table.prototype.calc = function (task) {
    throw Error('Not implemented!');
};


module.exports = {
    Table: Table,
};