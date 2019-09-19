var m_utils = require('./utils');
var m_column = require('./column');

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
            throw 'New columns list must have the same length!';
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
        throw 'Bad column key ' + column;
    }
    return new m_column.Column(null, this._columns[column], this, this._columns[column]);
};


module.exports = {
    Table: Table,
};