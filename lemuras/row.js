// https://github.com/AivanF/LemurasJS
var U = require('./utils');
var P = require('./processing');

var Row = function (table, row_index, values, columns) {
    if (!values) {
        if (!table || U.is_nil(row_index)) {
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
    this.column_names = columns;
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

Object.defineProperty(Row.prototype, 'length', {
    get: function () {
        return this.colcnt;
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
        if (U.is_string(column)) {
            var ind = this.column_names.indexOf(column);
            if (ind < 0) {
                throw TypeError('Column {} does not exist!'.format(column));
            }
            column = ind;
        }
        return this.values[column];
    } else {
        return this.table.cell(column, this.row_index);
    }
};

Row.prototype.set_value = function (column, value) {
    if (this.values) {
        if (U.is_string(column)) {
            this.values[this.column_names.indexOf(column)] = value;
        } else {
            this.values[column] = value;
        }
    } else {
        this.table.set_cell(column, this.row_index, value);
    }
};

Row.prototype.get_type = function (column, value) {
    return U.get_type(this.get_values());
};

Row.prototype.calc = function (task, abc) {
    if (U.is_string(task)) {
        if (P.aggfuns[task]) {
            task = P.aggfuns[task];
        } else {
            throw Error('Applied function named "{}" does not exist!'.format(task));
        }
    }
    var args = [this.get_values()];
    args = args.concat( U.args2array(arguments).slice(1) );
    return task.apply(null, args);
};

Row.prototype.forEach = function (callback) {
    // callback = function (value, index, column_name)
    for (var i = 0; i < this.colcnt; i++) {
        callback(this.get_value(i), i, this.columns[i]);
    }
};

Row.prototype.copy = function () {
    return new Row(null, null, this.get_values(), this.columns);
};

Row.prototype.toString = function () {
    var values = this.get_values().map(U.partial(U.repr_cell, [undefined, true]));
    var res;
    if (!this.values) {
        res = '- Row {} of table "{}"'.format(this.row_index, this.table.title);
    } else {
        res = '- Row independent';
    }
    res += '\n' + values.join(', ');
    return res;
};


module.exports = {
    Row: Row,
};