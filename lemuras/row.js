// https://github.com/AivanF/LemurasJS
var m_utils = require('./utils');
var m_processing = require('./processing');

var Row = function (table, row_index, values, columns) {
    if (!values) {
        if (!table || m_utils.is_nil(row_index)) {
            throw Error('Both table and row_index must be set!');
        }
    } else {
        if (table) {
            throw Error('Either values or table must be not None!');
        }
        if (!columns) {
            columns = [];
            for (var i = 0; i < values.length; i++) {
                columns.push('c' + i);
            }
        }
    }
    this.table = table;
    this.row_index = row_index;
    this.values = values;
    this.column_names = column_names;
};

Object.defineProperty(Row.prototype, 'colcnt', {
    get: function () {
        if (this.values) {
            return this.values.length;
        } else {
            return this.table.colcnt;
        }
    }
});

Object.defineProperty(Row.prototype, 'columns', {
    get: function () {
        if (this.values) {
            return this.column_names;
        } else {
            return this.table.columns;
        }
    }
});

Row.prototype.get_values = function () {
    if (this.values) {
        return this.values;
    } else {
        var res = [];
        for (var i = 0; i < this.table.colcnt; i++) {
            res.push(this.table.rows[this.row_index][i]);
        }
        return res;
    }
};

Row.prototype.get_value = function (column) {
    if (this.values) {
        if (m_utils.is_string(column)) {
            return this.values[this.column_names.indexOf(column)];
        } else {
            return this.values[column];
        }
    } else {
        return this.table.cell(column, this.row_index);
    }
};

Row.prototype.set_value = function (column, value) {
    if (this.values) {
        if (m_utils.is_string(column)) {
            this.values[this.column_names.indexOf(column)] = value;
        } else {
            this.values[column] = value;
        }
    } else {
        this.table.set_cell(column, this.row_index, value);
    }
};

Row.prototype.get_type = function (column, value) {
    return m_utils.get_type(this.get_values());
};

Row.prototype.calc = function (task, abc) {
    if (m_utils.is_string(task)) {
        if (m_processing.aggfuns[task]) {
            task = m_processing.aggfuns[task];
        } else {
            throw Error('Applied function named "{}" does not exist!'.format(task));
        }
    }
    var args = [this.get_values()];
    args = args.concat( m_utils.args2array(args2array).slice(1) );
    return task.apply(null, );
};

Row.prototype.copy = function () {
    return new Row(null, null, this.get_values(), this.columns);
};

Row.prototype.length = function () {
    return this.colcnt;
};


module.exports = {
    Row: Row,
};