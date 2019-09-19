var m_utils = require('./utils');
var m_processing = require('./processing');

var Column = function (values, title, table, source_name) {
    this.title = title || 'NoName';
    if (!values && !table) {
        throw 'Either values or table must be not null!';
    }
    if (values && table) {
        throw 'Either values or table must be given, not both of them!';
    }
    if (table && !source_name) {
        throw 'Table requres source_name argument!';
    }
    this.values = values;  // TODO: check type is array
    this.table = table;
    this.source_name = source_name;
};

Column.prototype.get_values = function () {
    if (this.values) {
        return this.values;
    } else {
        var column_index = this.table.column_indices[this.source_name];
        var res = [];
        return this.table.rows.map(function (row) {
            return row[column_index];
        });
    }
};

Column.prototype.get_value = function (row_index) {
    if (this.values) {
        return this.values[row_index];
    } else {
        var column_index = this.table.column_indices[this.source_name];
        return this.table.rows[row_index][column_index];
    }
};

Column.prototype.set_value = function (row_index, value) {
    if (this.values) {
        this.values[row_index] = value;
    } else {
        var column_index = this.table.column_indices[this.source_name];
        this.table.rows[row_index][column_index] = value;
    }
};

Column.prototype.forEach = function (callback) {
    for (var i = 0; i < this.rowcnt; i++) {
        callback(this.get_value(i), i);
    }
};

Column.make = function (length, value, title) {
    var values = [];
    for (var i = 0; i < length; i++) {
        values.push(value);
    }
    return Column(values, title);
};

Column.make_index = function (length, title) {
    var values = [];
    for (var i = 0; i < length; i++) {
        values.push(i);
    }
    return new Column(values, title);
};

Column.prototype.get_type = function () {
    var limit = this.rowcnt;
    if (limit > 4096) {
        limit = Math.floor(limit / 3);
    } else if (limit > 2048) {
        limit = Math.floor(limit / 2);
    }
    return m_utils.get_type(this.get_values(), limit);
};

Column.prototype.folds = function (fold_count, start) {
    throw 'Not implemented!';
};

Column.prototype.apply = function (task, defaults, separate) {
    if (m_utils.is_string(task)) {
        if (m_processing.typefuns[task]) {
            task = m_processing.typefuns[task];
            if (m_utils.is_undefined(separate)) {
                separate = false;
            }
        } else if (m_processing.applyfuns[task]) {
            task = m_processing.applyfuns[task];
            if (m_utils.is_undefined(separate)) {
                separate = true;
            }
        } else {
            throw 'Applied function named "' + task + '" does not exist!';
        }
    } else {
        if (m_utils.is_undefined(separate)) {
            separate = false;
        }
    }
    if (!m_utils.is_undefined(defaults)) {
        task = m_utils.partial(task, defaults);
    }
    if (separate) {
        var res = [];
        for (var i = 0; i < this.rowcnt; i++) {
            res.push(task(this.get_value(i)));
        }
        return new Column(res, this.title);
    } else {
        for (var i = 0; i < this.rowcnt; i++) {
            this.set_value(i, task(this.get_value(i)));
        }
        return this;
    }
};



Object.defineProperty(Column.prototype, 'rowcnt', {
    get: function () {
        if (this.values) {
            return this.values.length;
        } else {
            return this.table.rowcnt;
        }
    }
});

Object.defineProperty(Column.prototype, 'length', {
    get: function () {
        if (this.values) {
            return this.values.length;
        } else {
            return this.table.rowcnt;
        }
    }
});


module.exports = {
    Column: Column,
};