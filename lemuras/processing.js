// https://github.com/AivanF/LemurasJS
var U = require('./utils');

function mode(list) {
    var numMapping = {};
    var greatestFreq = 0;
    var res;
    list.forEach(function findMode(value) {
        numMapping[value] = (numMapping[value] || 0) + 1;

        if (greatestFreq < numMapping[value]) {
            greatestFreq = numMapping[value];
            res = value;
        }
    });
    return res;
}

function percentile(list, percent) {
    if (U.is_undefined(percent)) {
        percent = 0.5;
    }
    list = list.slice(0);
    list.sort();
    var k = (list.length-1) * percent;
    var f = Math.floor(k);
    var c = Math.ceil(k);
    if (f == c) {
        return list[f];
    } else {
        return list[f] * (c-k) + list[c] * (k-f)
    }
}

var Q1 = U.partial(percentile, [undefined, 0.25]);
var Q2 = U.partial(percentile, [undefined, 0.5]);
var Q3 = U.partial(percentile, [undefined, 0.75]);
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
    if (U.is_undefined(ddof)) {
        ddof = 0;
    }
    if (list.length >= 1+ddof) {
        if (U.is_undefined(mean)) {
            mean = avg(list);
        }
        var s = sum(list.map(function (x) {return Math.pow(x-mean, 2);}));
        var disp = s / (list.length - ddof);
        return Math.pow(disp, 0.5);
    } else {
        return 0;
    }
}

function distinct(list) {
    var res = [];
    list.forEach(function (value) {
        if (res.indexOf(value) < 0) {
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
    for (var i = 0; i < list.length; i++) {
        if (list[i] === null) {
            res = list[i];
        }
    }
    return res;
}

function max(list) {
    var res = Number.NEGATIVE_INFINITY;
    for (var i = 0; i < list.length; i++) {
        if (list[i] > res) {
            res = list[i];
        }
    }
    return res;
}

function min(list) {
    var res = Number.POSITIVE_INFINITY;
    for (var i = 0; i < list.length; i++) {
        if (list[i] < res) {
            res = list[i];
        }
    }
    return res;
}

var aggfuns = {
    avg: U.call_with_numbers_only(avg),
    mean: U.call_with_numbers_only(avg),
    mode: U.call_with_numbers_only(mode),
    middle: U.call_with_numbers_only(median),
    median: U.call_with_numbers_only(median),
    q1: U.call_with_numbers_only(Q1),
    q2: U.call_with_numbers_only(Q2),
    q3: U.call_with_numbers_only(Q3),
    std: U.call_with_numbers_only(std),
    sum: U.call_with_numbers_only(sum),

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
    if (U.is_undefined(def)) {
        def = '';
    }
    if (U.is_string(value)) {
        return value;
    } else if (!U.is_nil(value)) {
        return value.toString();
    } else {
        return def;
    }
}

function parse_int(value, def, hard) {
    if (U.is_undefined(def)) {
        def = 0;
    }
    if (U.is_undefined(hard)) {
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
    if (U.is_undefined(def)) {
        def = 0.0;
    }
    var res = Number(value);
    if (!Number.isNaN(res)) {
        return res;
    }
    return def;
}

function parse_date_format(_date, _format) {
    // https://stackoverflow.com/a/25961926/5308802
    var _delimiter = _format.match(/\W/g)[0];
    var formatLowerCase = _format.toLowerCase();
    var formatItems = formatLowerCase.split(_delimiter);
    var dateItems = _date.split(_delimiter);
    var monthIndex = formatItems.indexOf("mm");
    var dayIndex = formatItems.indexOf("dd");
    var yearIndex = formatItems.indexOf("yyyy");
    var month = parseInt(dateItems[monthIndex]);
    month -= 1;
    var formatedDate = new Date(dateItems[yearIndex],month,dateItems[dayIndex]);
    return formatedDate;
}

function parse_date(value, def) {
    if (U.is_undefined(def)) {
        def = null;
    }
    if (value instanceof Date) {
        return value;
    } else if (U.is_string(value)) {
        var res = new Date(value);
        // Try usual JS format firstly
        if (!isNaN(res)) {
            return res;
        }
        // TODO: add support for time
        value = value.split(' ')[0];
        if (value.indexOf('/') > 0) {
            res = parse_date_format(value, 'mm/dd/yyyy');
        } else if (value.indexOf('-') > 0) {
            res = parse_date_format(value, 'yyyy-mm-dd');
        } else if (value.indexOf('.') > 0) {
            res = parse_date_format(value, 'dd.mm.yyyy');
        }
        if (!isNaN(res)) {
            return res;
        }

    }
    return def;
}

function is_none(value) {
    return Number.isNaN(value) || U.is_undefined(value) || value === null;
}

function none_to(value, def) {
    if (U.is_undefined(def)) {
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
    date: parse_date,
    none_to: none_to,
}


function lengths(value, strings_only) {
    if (strings_only && !U.is_string(value)) {
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

    istype: function (value, type) {
        return (typeof value) == type;
    },
    isinstance: function (value, type) {
        return value instanceof type;
    },

    is_string: U.is_string,
    is_bool: U.is_bool,
    is_int: U.is_int,
    is_float: U.is_float,
}


function parse_value(value, empty) {
    var res = parse_int(value, null, false);
    if (!is_none(res)) {
        return res;
    }
    res = parse_float(value, null);
    if (!is_none(res)) {
        return res;
    }
    res = parse_date(value, null);
    if (!is_none(res)) {
        return res;
    }
    res = value.toString().toLowerCase();
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
    // Function storages
    aggfuns: aggfuns,
    typefuns: typefuns,
    applyfuns: applyfuns,
    // Types handling
    parse_value: parse_value,
    parse_row: parse_row,
};