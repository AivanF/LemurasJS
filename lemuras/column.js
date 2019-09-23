// https://github.com/AivanF/LemurasJS
var m_utils = require('./utils');
var m_processing = require('./processing');

var Column = function (values, title, table, source_name) {
    this.title = title || 'NoName';
    if (!values && !table) {
        throw TypeError('Either values or table must be not null!');
    }
    if (values && table) {
        throw TypeError('Either values or table must be given, not both of them!');
    }
    if (table && !source_name) {
        throw TypeError('Column linking requires source_name argument!');
    }
    if (values) {
        if (!Array.isArray(values)) {
            throw TypeError('Column values must be an array!');
        }
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

Column.make = function (length, value, title) {
    var values = [];
    for (var i = 0; i < length; i++) {
        values.push(value);
    }
    return new Column(values, title);
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
    throw Error('Not implemented!');
};

Column.prototype.apply = function (task, defaults) {
    if (m_utils.is_string(task)) {
        if (m_processing.typefuns[task]) {
            task = m_processing.typefuns[task];
        } else if (m_processing.applyfuns[task]) {
            task = m_processing.applyfuns[task];
        } else {
            throw Error('Applied function named "' + task + '" does not exist!');
        }
    }
    var defaults = m_utils.args2array(arguments).slice(1);


    for (var i = 0; i < this.rowcnt; i++) {
        args = [this.get_value(i)].concat(defaults);
        this.set_value(i, task.apply(null, args));
    }
    return this;
};

Column.prototype.calc = function (task, defaults) {
    if (m_utils.is_string(task)) {
        if (m_processing.aggfuns[task]) {
            task = m_processing.aggfuns[task];
        } else {
            throw Error('Applied function named "' + task + '" does not exist!');
        }
    }
    var args = [this.get_values()];
    args = args.concat( m_utils.args2array(arguments).slice(1) );
    return task.apply(null, args);
};

Column.prototype.loc = function (prism) {
    var res = [];
    if (prism instanceof Column) { 
        if (this.rowcnt == prism.rowcnt) {
            for (var i = 0; i < this.rowcnt; i++) {
                if (prism.get_value(i)) {
                    res.push(this.get_value(i));
                }
            }
        } else {
            throw Error('Loc arument array must have the same length!');
        }
    } else if (Array.isArray(prism)) {
        if (this.rowcnt == prism.length) {
            for (var i = 0; i < this.rowcnt; i++) {
                if (prism[i]) {
                    res.push(this.get_value(i));
                }
            }
        } else {
            throw Error('Loc arument array must have the same length!');
        }
    } else {
        throw TypeError('Loc argument must be an array or a Column!')
    }
    var title = 'Filtered ' + this.title;
    return new Column(res, title);
};

Column.prototype.forEach = function (callback) {
    // callback = function (value, index, column_name)
    for (var i = 0; i < this.rowcnt; i++) {
        callback(this.get_value(i), i);
    }
};

Column.prototype.copy = function (task, defaults) {
    return new Column(this.get_values(), this.title);
};

Column.prototype.toString = function () {
    var n = self.rowcnt;
    var ns = false;
    if (n > 12) {
        n = 10;
        ns = true;
    }
    var values = this.get_values().slice(0, n).map(m_utils.partial(m_utils.repr_cell, [undefined, true]));
    var res;
    if (!this.values) {
        res = '- Column "{}" of table "{}", '.format(this.title, this.table.title);
    } else {
        res = '- Column "{}", '.format(this.title);
    }
    res += this.rowcnt + ' values\n' + values.join(', ');
    if (ns) {
        res += ' . .';
    }
    return res;
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


Column.prototype.indexOf = function (value) {
    return this.get_values().indexOf(value);
};

Column.prototype.isin = function (other) {
    var values = [];
    for (var i = 0; i < this.rowcnt; i++) {
        values.push(other.indexOf(this.get_value(i)) >= 0);
    }
    return new Column(values);
};

Column.prototype.findin = function (other) {
    var values = [];
    for (var i = 0; i < this.rowcnt; i++) {
        values.push(other.indexOf(this.get_value(i)));
    }
    return new Column(values);
};

Column.prototype._op1 = function (func) {
    var values = [];
    for (var i = 0; i < this.rowcnt; i++) {
        values.push(func(this.get_value(i)));
    }
    return new Column(values);
};
Column.prototype._op2 = function (other, func) {
    var values = [];
    if (other instanceof Column) {
        if (this.rowcnt != other.rowcnt) {
            throw Error('Operation argument column has wrong length {}, but column has {}'.format(other.length, this.rowcnt));
        }
        for (var i = 0; i < this.rowcnt; i++) {
            values.push(func(this.get_value(i), other.get_value(i)));
        }
    } else if (Array.isArray(other)) {
        if (this.rowcnt != other.length) {
            throw Error('Operation argument array has wrong length {}, but column has {}'.format(other.length, this.rowcnt));
        }
        for (var i = 0; i < this.rowcnt; i++) {
            values.push(func(this.get_value(i), other[i]));
        }
    } else {
        // Handle "other" as a raw value
        for (var i = 0; i < this.rowcnt; i++) {
            values.push(func(this.get_value(i), other));
        }
    }
    return new Column(values);
};

Column.prototype.inv = function () {
    return this._op1(function (value) {
        return !value;
    });
};
Column.prototype.abs = function () {
    return this._op1(function (value) {
        return Math.abs(value);
    });
};

Column.prototype.band = function (other) {
    return this._op2(other, function (a, b) {
        return a & b;
    });
};
Column.prototype.bor = function (other) {
    return this._op2(other, function (a, b) {
        return a | b;
    });
};
Column.prototype.bxor = function (other) {
    return this._op2(other, function (a, b) {
        return a ^ b;
    });
};

Column.prototype.and = function (other) {
    return this._op2(other, function (a, b) {
        return a && b;
    });
};
Column.prototype.or = function (other) {
    return this._op2(other, function (a, b) {
        return a || b;
    });
};
Column.prototype.xor = function (other) {
    return this._op2(other, function (a, b) {
        return !a != !b;
    });
};

Column.prototype.add = function (other) {
    return this._op2(other, function (a, b) {
        return a + b;
    });
};
Column.prototype.sub = function (other) {
    return this._op2(other, function (a, b) {
        return a - b;
    });
};
Column.prototype.mul = function (other) {
    return this._op2(other, function (a, b) {
        return a * b;
    });
};
Column.prototype.div = function (other) {
    return this._op2(other, function (a, b) {
        return a / b;
    });
};
Column.prototype.mod = function (other) {
    return this._op2(other, function (a, b) {
        return a % b;
    });
};
Column.prototype.pow = function (other) {
    return this._op2(other, function (a, b) {
        return Math.pow(a, b);
    });
};
Column.prototype.gt = function (other) {
    return this._op2(other, function (a, b) {
        return a > b;
    });
};
Column.prototype.lt = function (other) {
    return this._op2(other, function (a, b) {
        return a < b;
    });
};
Column.prototype.ge = function (other) {
    return this._op2(other, function (a, b) {
        return a >= b;
    });
};
Column.prototype.le = function (other) {
    return this._op2(other, function (a, b) {
        return a <= b;
    });
};
Column.prototype.eq = function (other) {
    return this._op2(other, function (a, b) {
        return a == b;
    });
};
Column.prototype.ne = function (other) {
    return this._op2(other, function (a, b) {
        return a != b;
    });
};


module.exports = {
    Column: Column,
};