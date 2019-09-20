// https://github.com/AivanF/LemurasJS

function is_undefined(value) {
    return typeof value === 'undefined';
}

function is_string(value) {
    return (typeof value === 'string' || value instanceof String);
}

function is_bool(value) {
    return !!value === value;
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
    // Null Bool Int Float String Date Other Mixed
    var tp = 'n';
    var ln = 0;
    var el, kind;
    for (var i = 0; i < data.length; i++) {
        if (limit && i > limit) {
            break;
        }
        el = data[i];
        ln = Math.max(ln, ('' + el).toString().length);

        if (is_bool(el)) {
            kind = 'b';
        } else if (is_int(el)) {
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

var formula_op2 = {
    '&': 'band',
    '|': 'bor',
    '^': 'bxor',

    '&&': 'and',
    '||': 'or',
    '^^': 'xor',

    '+': 'add',
    '-': 'sub',
    '*': 'mul',
    '/': 'div',
    '%': 'mod',
    '**': 'pow',

    '>': 'gt',
    '<': 'lt',
    '>=': 'ge',
    '<=': 'le',
    '==': 'eq',
    '!=': 'ne',
}

function parse_formula(code) {
    var cur, nex, prev = null;
    var quote_mode = null; // null or ' or "
    var op;
    var to_close = []; // list of opened_par values
    var opened_par = 0;
    var res = '';
    function try_close() {
        if (opened_par == to_close[to_close.length-1]) {
            res += ')';
            to_close.splice(-1, 1); // remove last value
        }
    }
    code += ' '; // to always have next
    for (var i = 0; i < code.length-1; i++) {
        cur = code[i];
        nex = code[i+1];
        if (quote_mode) {
            if (cur == quote_mode && prev != '\\') {
                quote_mode = null;
            }
            res += cur;
        } else {
            if (cur == '"') {
                quote_mode = '"';
                res += cur;
            } else if (cur == "'") {
                quote_mode = "'";
                res += cur;
            } else {
                op = formula_op2[cur + nex];
                if (op) {
                    i++;
                } else {
                    op = formula_op2[cur];
                }
                if (op) {
                    try_close();
                    res += '.' + op + '(';
                    to_close.push(opened_par);
                } else {
                    res += cur;
                    if (cur == '(') {
                        opened_par++;
                    } else if (cur == ')') {
                        try_close();
                        opened_par--;
                    }
                }
            }
        }
        prev = cur;
    }
    try_close();
    return res;
}

function create_formula(code, args) {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function
    // a+b+c => a.add(b).add(c)
    // (a+b)*c => (a.add(b)).mult(c)
    code = 'return ' + parse_formula(code) + ';';
    args = args || [];
    args = [null].concat(args.concat([code]));
    console.log(null, 'args', args);
    return new (Function.prototype.bind.apply(Function, args));
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
    parse_formula: parse_formula,
    create_formula: create_formula,
};