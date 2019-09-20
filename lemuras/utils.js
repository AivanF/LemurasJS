
function is_undefined(value) {
    return typeof value === 'undefined';
}

function is_string(value) {
    return (typeof value === 'string' || value instanceof String);
}

function is_int(value) {
    return Number.isInteger(value);
}

function is_float(value) {
    return parseFloat(value) === value;
}

function repr_cell(value, quote_strings) {
    if (is_string(value) && quote_strings) {
        return '"' + value + '"';
    } else {
        return value;
    }
}

function get_type(data, limit) {
    // Null Int Float String Date Other Mixed
    var tp = 'n';
    var ln = 0;
    var el, kind;
    for (var i = 0; i < data.length; i++) {
        if (limit && i > limit) {
            break;
        }
        el = data[i];
        ln = Math.max(ln, ('' + el).toString().length);

        if (is_int(el)) {
            kind = 'i';
        } else if (is_float(el)) {
            kind = 'f';
        } else if (el instanceof Date) {
            kind = 'd';
        } else if (is_string(el)) {
            kind = 's';
        } else {
            kind = 'o'
        }

        if (tp == 'n') {
            tp = kind;
        } else if (tp != kind) {
            if (tp == 'f' && kind == 'i') {
                ; // pass
            } else if (tp == 'i' && kind == 'f') {
                tp = 'f';
            } else {
                tp = 'm';
            }
        }
    }
    return {
        type: tp,
        length: ln,
    };
}

function partial(func, defaults) {
    // defaults must be a list with the same length as func arguments
    // skipped arguments must equal undefined
    return function() {
        var args = [];
        var j = 0;
        for (var i = 0; i < defaults.length; i++) {
            if (is_undefined(defaults[i])) {
                args.push(arguments[j]);
                j++;
            } else {
                args.push(defaults[i]);
            }
        }
        return func.apply(this, args);
    };
}

function format(txt, args) {
    var res = txt;
    for (var i = 0; i < args.length; i++) {
        res = res.replace('{' + i + '}', '' + args[i]);
        res = res.replace('{}', '' + args[i]);
    }
    return res;
}

module.exports = {
    is_undefined: is_undefined,
    is_string: is_string,
    is_int: is_int,
    is_float: is_float,
    repr_cell: repr_cell,
    get_type: get_type,
    partial: partial,
    format: format,
};