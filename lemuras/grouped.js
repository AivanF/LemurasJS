// https://github.com/AivanF/LemurasJS
var m_utils = require('./utils');
var m_processing = require('./processing');
var m_table = require('./table');

var Grouped = function (key_columns, source_columns, source_column_indices, source_name) {
    if (!m_utils.is_string(source_name)) {
        throw TypeError('Grouped source_name must be a string, but "{}" given'.format(source_name));
    }
    this.source_name = source_name;
    this.keys = key_columns;
    this.key_count = key_columns.length;
    // {'target_column_name': {'new_column_name': function}}
    this.fun = null;

    // Indices of key columns in original table
    this.ownkey2srckey = [];
    for (var i = 0; i < key_columns.length; i++) {
        this.ownkey2srckey.push(source_column_indices[key_columns[i]]);
    }

    // Aggregating (non-key) column names -> result column ind
    this.agg_column2ind = {};
    // Whether old columns should be saved
    this.src_column_is_agg = [];
    var step = 0;
    for (var i = 0; i < source_columns.length; i++) {
        if (key_columns.indexOf(source_columns[i]) < 0) {
            this.src_column_is_agg.push(true);
            this.agg_column2ind[source_columns[i]] = step;
            step++;
        } else {
            this.src_column_is_agg.push(false);
        }
    }

    // Dict of dict of ... of list with a list of agg columns
    // Keys of dicts are unique values of key-column
    if (this.key_count > 0) {
        this.values = {};
    } else {
        this.values = m_utils.list_of_lists(this.agg_column2ind.length);
    }
};

Grouped.prototype.add = function (row) {
    var vals = this.values;
    for (var i = 0; i < this.key_count; i++) {
        var last = i == this.key_count-1;
        var ind = this.ownkey2srckey[i];
        var cur = row.get_value(ind);
        if (!vals[cur]) {
            if (last) {
                // Store columns independently
                vals[cur] = m_utils.list_of_lists(Object.keys(this.agg_column2ind).length);
            } else {
                // Add one more dict layer
                vals[cur] = {};
            }
        }
        vals = vals[cur];
    }

    // Save values with appropriate indices only - not key columns
    var step = 0;
    for (var i = 0; i < row.length; i++) {
        if (this.src_column_is_agg[i]) {
            // Columns-first structure
            vals[step].push(row.get_value(i));
            step++
        }
    }
};

Grouped.prototype._agglist = function (keys, cols) {
    var res = keys;
    for (var target_name in this.fun) {
        var cur_col = cols[this.agg_column2ind[target_name]];
        for (var new_name in this.fun[target_name]) {
            var task = this.fun[target_name][new_name];
            var got;
            if (m_utils.is_string(task)) {
                if (m_processing.aggfuns[task]) {
                    got = m_processing.aggfuns[task](cur_col);
                } else {
                    throw Error('Aggregation function "{}" does not exist!'.format(task));
                }
            } else {
                if (m_utils.is_function(task)) {
                    got = task(cur_col);
                } else {
                    throw Error('Aggregation function must be a callable!');
                }
            }
            if (m_utils.is_undefined(got)) {
                throw Error('Aggregation function returned undefined!');
            }
            res.push(got);
        }
    }
    return res;
};

Grouped.prototype._recurs = function (task, vals, keys) {
    vals = vals || this.values;
    keys = keys || [];
    var res = [];
    if (Array.isArray(vals)) {
        var v = task(keys, vals);
        if (!m_utils.is_undefined(v)) {
            res.push(v);
        }
    } else {
        for (var key in vals) {
            res = res.concat(this._recurs(task, vals[key], [].concat(keys).concat([key])));
        }
    }
    return res;
};

Grouped.prototype.agg = function (fun, default_fun) {
    if (default_fun) {
        for (var target_name in this.agg_column2ind) {
            if (!fun[target_name]) {
                fun[target_name] = {};
            }
            if (m_utils.is_dict(default_fun)) {
                for (var key in default_fun) {
                    fun[target_name]['{}_{}'.format(target_name, key)] = default_fun[key];
                }
            } else if (Array.isArray(default_fun)) {
                default_fun.forEach(function (task) {
                    if (!m_utils.is_string(task)) {
                        throw new TypeError('Default functions in an array must be string names!');
                    }
                    fun[target_name]['{}_{}'.format(target_name, task)] = task;
                });
            } else {
                fun[target_name][target_name] = default_fun;
            }
        }
    }
    for (var target_name in fun) {
        if (m_utils.is_undefined(this.agg_column2ind[target_name])) {
            throw new Error('Cannot aggregate key column "{}"'.format(target_name));
        }
        if (!m_utils.is_dict(fun[target_name])) {
            var tmp = {};
            tmp[target_name] = fun[target_name];
            fun[target_name] = tmp;
        }
    }
    this.fun = fun;
    console.log(this.fun);
    var cols = this.keys;
    for (var target_name in fun) {
        for (var new_name in fun[target_name]) {
            cols.push(new_name);
        }
    }
    var self = this;
    var rows = this._recurs(function (keys, vals) {
        return self._agglist(keys, vals);
    });
    return new m_table.Table(cols, rows, 'Aggregated ' + this.source_name);
};

module.exports = {
    Grouped: Grouped,
};