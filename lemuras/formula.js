// https://github.com/AivanF/LemurasJS
var m_utils = require('./utils');

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

var formula_op1 = {
    '!': 'inv',
    '#': 'abs',
}

function parse_formula(code) {
    code = code.replaceAll('[[', '.column(');
    code = code.replaceAll(']]', ')');
    // Translate operations
    var cur, nex, prev = null;
    var quote_mode = null; // null or ' or "
    var op, enc_op = 0;
    var to_close = []; // list of opened_par values
    var doors = {}; // for unary operations
    var opened_par = 0;
    var res = '';
    function try_close() {
        if (opened_par == to_close[to_close.length-1]) {
            if (doors[opened_par]) {
                res += doors[opened_par];
                doors[opened_par] = null;
            }
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
    try_close();
    return res;
}

function formula(source_code, args) {
    var parsed = parse_formula(source_code);
    try {
        args = args || [];
        args = [null].concat(args.concat(['return ' + parsed + ';']));
        var res = new (Function.prototype.bind.apply(Function, args));
        res.source = source_code;
        res.parsed = parsed;
        return res;
    } catch (err) {
        throw 'Got {}: {}\nParsing {}\nTo {}'.format(err.name, err.message, source_code, parsed);
    }
}

module.exports = {
    formula: formula,
};