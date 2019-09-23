// https://github.com/AivanF/LemurasJS
var U = require('./utils');

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

    '~>': 'isin',
    '<~': 'findin',
}

var formula_op1 = {
    '!': 'inv',
    '#': 'abs',
}

function extract_names(code) {
    var i, last = 0;
    var property = false;
    var quote_mode = null; // null or ' or "
    var cur, prev = null;
    var names = [];
    function try_add(i) {
        if (property) {
            return;
        }
        if (i > last) {
            var name = code.slice(last, i);
            if (!U.isLetter(name[0])) {
                return;
            }
            if (names.indexOf(name) >= 0) {
                return;
            }
            if (!globalThis[name]) {
                names.push(name);
            }
        }
    }
    for (i = 0; i < code.length; i++) {
        cur = code[i];
        if (quote_mode) {
            if (cur == quote_mode && prev != '\\') {
                quote_mode = null;
                last = i+1;
            }
        } else {
            if (cur == '"') {
                quote_mode = '"';
            } else if (cur == "'") {
                quote_mode = "'";
            } else if (cur == '.') {
                property = true;
            } else if (cur == '_' || U.isLetter(cur)) {
                // pass as a valid symbol
            } else if (U.isDigit(cur)) {
                if (last == i-1) {
                    property = true;
                } else {
                    // pass as a valid symbol
                }
            } else {
                try_add(i);
                property = false;
                last = i+1;
            }
        }
        prev = cur;
    }
    try_add(i);
    return names;
}

function parse_formula(code) {
    // TODO: transform col.int(...) to col.apply('int', ...)
    // TODO: transform col.sum(...) to col.calc('sum', ...)
    // TODO: transform tbl[["field"]]:=... to tbl.set_column("field", ...)
    // TODO: transform tbl[["field"]]((j)):=... to tbl.column("field").set_value(j, ...)
    // TODO: transform col((j)):=... to column.set_value(j, ...)

    // Translate operations
    var cur, nex, prev = null;
    var quote_mode = null; // null or ' or "
    var op, enc_op = 0;
    var to_close = []; // list of opened_par values
    var doors = {}; // for unary operations
    var opened_par = 0;
    var res = '';
    function try_close() {
        if (to_close.length > 0 && (opened_par == to_close[to_close.length-1])) {
            if (doors[opened_par]) {
                res += doors[opened_par];
                doors[opened_par] = null;
            }
            res += ')';
            to_close.splice(-1, 1); // remove last value
            return true;
        } else {
            return false;
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
                op = formula_op1[cur];
                if (op) {
                    to_close.push(opened_par);
                    doors[opened_par] = '.' + op + '(';
                } else {
                    op = formula_op2[cur + nex];
                    if (!enc_op && op) {
                        i++;
                    } else {
                        op = formula_op2[cur];
                    }
                    if (!enc_op && op) {
                        try_close();
                        res += '.' + op + '(';
                        to_close.push(opened_par);
                    } else if (cur == '\\') {
                        enc_op = 2;
                    } else if (cur == ' ') {
                        ; // don't add whitespaces
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
        }
        if (enc_op > 0) {
            enc_op--;
        }
        prev = cur;
    }
    while (try_close()) {};
    if (opened_par != 0) {
        throw new SyntaxError('Bad parentheses count!');
    }
    // TODO: prevent replacing in strings
    // Translate tbl[["field"]] to tbl.column("field")
    res = res.replaceAll('[[', '.column(');
    res = res.replaceAll(']]', ')');
    return res;
}

var formulas_cache = {};

function create_formula(source_code, formula_args) {
    if (formulas_cache[source_code]) {
        return formulas_cache[source_code];
    }
    var parsed = null;
    try {
        parsed = parse_formula(source_code);
        if (!formula_args) {
            formula_args = extract_names(source_code);
        }
        var args = [null].concat(formula_args.concat(['return ' + parsed + ';']));
        var inner = new (Function.prototype.bind.apply(Function, args));
        var Formula = function () {
            if (formula_args.length != arguments.length) {
                throw new Error('Formula requires {} arguments, but {} were given'.format(formula_args.length, arguments.length));
            }
            return inner.apply(null, arguments);
        }
        Formula.source = source_code;
        Formula.parsed = parsed;
        Formula.args = formula_args;
        formulas_cache[source_code] = Formula;
        return Formula;
    } catch (err) {
        throw new SyntaxError('Got {}: {}\nParsing {}\nTo {}'.format(err.name, err.message, source_code, parsed));
    }
}

module.exports = {
    extract_names: extract_names,
    create_formula: create_formula,
};