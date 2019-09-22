// https://github.com/AivanF/LemurasJS
var m_utils = require('./utils');
var m_processing = require('./processing');
var m_table = require('./table');

var Grouped = function (key_columns, source_columns, source_column_indices, source_name) {
    if (!m_utils.is_string(source_name)) {
        throw new TypeError('Grouped source_name must be a string, but "{}" given'.format(source_name));
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
        this.values = m_utils.list_of_lists(Object.keys(this.agg_column2ind).length);
    }

    // JS converts dict keys to strings,
    // So there is a need to store values
    // of key fields with original types
    // This dict is: own_key_id => str_value => original_value
    this.source_values = {};
};

Grouped.prototype.add = function (row) {
    var vals = this.values;
    for (var i = 0; i < this.key_count; i++) {
        var last = i == this.key_count-1;
        var ind = this.ownkey2srckey[i];
        var cur = row.get_value(ind);
        this.source_values[i] = this.source_values[i] || {};
        this.source_values[i][cur] = cur;
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
                    throw new Error('Aggregation function "{}" does not exist!'.format(task));
                }
            } else {
                if (m_utils.is_function(task)) {
                    got = task(cur_col);
                } else {
                    throw new TypeError('Aggregation function must be a function!');
                }
            }
            if (m_utils.is_undefined(got)) {
                throw new Error('Aggregation function returned undefined!');
            }
            res.push(got);
        }
    }
    return res;
};

Grouped.prototype._recurs = function (task, vals, keys, ind) {
    vals = vals || this.values;
    keys = keys || [];
    ind = ind || 0;
    var res = [];
    var new_keys;
    if (Array.isArray(vals)) {
        var v = task(keys, vals);
        if (!m_utils.is_undefined(v)) {
            res.push(v);
        }
    } else {
        for (var key in vals) {
            // Add previous keys and this key value with proper type
            new_keys = [].concat(keys).concat([this.source_values[ind][key]]);
            res = res.concat(this._recurs(task, vals[key], new_keys, ind+1));
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
    var cols = this.keys.slice();
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

Grouped.prototype._make_group = function (keys, cols, add_keys, pairs) {
    var t = 'Group';
    var ids = {};
    for (var i = 0; i < this.keys.length; i++) {
        t += ' {}={}'.format(this.keys[i], keys[i]);
        if (pairs) {
            ids[this.keys[i]] = keys[i];
        }
    }
    var res = new m_table.Table([], [], t);
    if (add_keys) {
        for (var i = 0; i < this.keys.length; i++) {
            res.add_column(m_utils.arrayCreate(cols[0].length, keys[i]), this.keys[i]);
        }
    }
    for (var el in this.agg_column2ind) {
        res.add_column(cols[this.agg_column2ind[el]], el);
    }
    if (pairs) {
        return [ids, res];
    } else {
        return res;
    }
};

Grouped.prototype.split = function (add_keys, pairs) {
    var self = this;
    return this._recurs(function (keys, cols) {
        return self._make_group(keys, cols, add_keys, pairs);
    });
};

Grouped.prototype.get_group = function (search_keys, add_keys) {
    if (m_utils.is_undefined(add_keys)) {
        add_keys = true;
    }
    // TODO: add support for search_keys as dict
    if (!Array.isArray(search_keys)) {
        search_keys = [search_keys];
    }
    var self = this;
    function find_table(keys, cols) {
        var matched = true;
        for (var i = 0; i < keys.length; i++) {
            if (keys[i] != search_keys[i]) {
                matched = false;
                break;
            }
        }
        if (matched) {
            return self._make_group(keys, cols, add_keys, false);
        }
    }
    // No check is needed because undefined
    // will be returned for missing values
    return this._recurs(find_table)[0];
};

Grouped.prototype.counts = function () {
    var rows = [];
    function task(keys, cols) {
        rows.push([].concat(keys).concat([cols[0].length]));
    }
    this._recurs(task);
    return new m_table.Table([].concat(this.keys).concat(['rows']), rows, 'Groups');
};

Grouped.prototype.toString = function () {
    return '- Grouped object "{}", keys: [{}], old columns: [{}].'.format(
        this.source_name, this.keys, Object.keys(this.agg_column2ind)
    )
};

module.exports = {
    Grouped: Grouped,
};