// https://github.com/AivanF/LemurasJS
var m_utils = require('./utils');

function mode(list) {
    throw Error('Not implemented!');
    // return max(set(lst), key=lst.count)
}

function percentile(list, percent) {
    if (m_utils.is_undefined(percent)) {
        percent = 0.5;
    }
    list = list.slice(0);
    var k = (list.length-1) * percent;
    var f = Math.floor(k);
    var c = Math.ceil(k);
    if (f == c) {
        return list[f];
    } else {
        return list[f] * (c-k) + list[c] * (k-f)
    }
}

var Q1 = m_utils.partial(percentile, [undefined, 0.25]);
var Q2 = m_utils.partial(percentile, [undefined, 0.5]);
var Q3 = m_utils.partial(percentile, [undefined, 0.75]);
var median = Q2;

function sum(list) {
    var res = 0;
    for (var i = 0; i < list.length; i++) {
        res += list[i];
    }
    return res;
}

function avg(list) {
    return sum(list) / list.length;
}

function std(list, ddof, mean) {
    if (list.length >= 1+ddof) {
        if (m_utils.is_undefined(mean)) {
            mean = avg(list);
        }
        var s = sum(list.map(function (x) {return Math.power(x-mean, 2);}));
        var disp = s / (list.length - ddof);
        return Math.power(disp, 0.5);
    } else {
        return 0;
    }
}

function distinct(list) {
    var res = [];
    list.forEach(function (value) {
        if (list.indexOf(value) < 0) {
            res.push(value);
        }
    });
    return res;
}

function nunique(list) {
    return distinct(list).length;
}

function nulls(list) {
    var res = 0;
    list.forEach(function (value) {
        if (value === null) {
            res += 1;
        }
    });
    return res;
}

function max(list) {
    var res = Number.NEGATIVE_INFINITY;
    list.forEach(function (value) {
        if (value > res) {
            res = value;
        }
    });
    return res;
}

function min(list) {
    var res = Number.POSITIVE_INFINITY;
    list.forEach(function (value) {
        if (value > res) {
            res = value;
        }
    });
    return res;
}

var aggfuns = {
    // avg: call_with_numbers_only(avg),
    // mean: call_with_numbers_only(avg),
    // mode: call_with_numbers_only(mode),
    // middle: call_with_numbers_only(median),
    // median: call_with_numbers_only(median),
    // q1: call_with_numbers_only(Q1),
    // q2: call_with_numbers_only(Q2),
    // q3: call_with_numbers_only(Q3),
    // std: call_with_numbers_only(std),
    // sum: call_with_numbers_only(sum),
    avg: avg,
    mean: avg,
    mode: mode,
    middle: median,
    median: median,
    q1: Q1,
    q2: Q2,
    q3: Q3,
    std: std,
    sum: sum,

    nunique: nunique,
    nulls: nulls,
    nones: nulls,
    min: min,
    max: max,
    count: function (list) {
        return list.length;
    },
    first: function (list) {
        return list[0];
    },
    last: function (list) {
        return list[list.length-1];
    },
    get: function (list, i) {
        return list[i];
    },
}


function make_str(value, def) {
    if (m_utils.is_string(value)) {
        return value;
    } else if (m_utils.is_undefined(def)) {
        return value.toString();
    } else {
        return def;
    }
}

function parse_int(value, def, hard) {
    if (m_utils.is_undefined(def)) {
        def = 0;
    }
    if (m_utils.is_undefined(hard)) {
        hard = true;
    }
    var res = Number(value);
    if (!Number.isNaN(res)) {
        if (hard) {
            return Math.floor(res);
        } else {
            if (Number.isInteger(res)) {
                return res;
            }
        }
    }
    return def;
}

function parse_float(value, def) {
    if (m_utils.is_undefined(def)) {
        def = 0.0;
    }
    var res = Number(value);
    if (!Number.isNaN(res)) {
        return res;
    }
    return def;
}

function is_none(value) {
    return Number.isNaN(value) || m_utils.is_undefined(value) || value === null;
}

function none_to(value, def) {
    if (m_utils.is_undefined(def)) {
        def = 0;
    }
    if (is_none(value)) {
        return def;
    } else {
        return value;
    }
}

var typefuns = {
    str: make_str,
    int: parse_int,
    float: parse_float,
    // date: parse_date, // TODO: here!
    none_to: none_to,
}


function lengths(value, strings_only) {
    if (strings_only && !m_utils.is_string(value)) {
        return null;
    } else {
        return value.toString().length;
    }
}

function isin(value, other) {
    return other.indexOf(value) >= 0;
}

var applyfuns = {
    isnull: is_none,
    lengths: lengths,
    isin: isin,
    // TODO: here!
    // istype: isinstance,
    // isinstance: isinstance,
}


function parse_value(value, empty) {
    var res = parse_int(value, null, false);
    if (!is_none) {
        return res;
    }
    var res = parse_float(value, null);
    if (!is_none) {
        return res;
    }
    // var res = parse_date(value, null);
    // if (!is_none) {
    //     return res;
    // }
    res = value.toString().toLowerCase()
    if (res == 'none' || res == 'null' || res.length == 0) {
        return empty;
    }
    return value;
}

function parse_row(list, empty) {
    for (var i = 0; i < list.length; i++) {
        list[i] = parse_value(list[i]);
    }
    return list;
}


module.exports = {
    aggfuns: aggfuns,
    typefuns: typefuns,
    applyfuns: applyfuns,
    parse_value: parse_value,
    parse_row: parse_row,
};