/**
 * @license
 * Copyright (c) 2017 The expand.js authors. All rights reserved.
 * This code may only be used under the BSD style license found at https://expandjs.github.io/LICENSE.txt
 * The complete set of authors may be found at https://expandjs.github.io/AUTHORS.txt
 * The complete set of contributors may be found at https://expandjs.github.io/CONTRIBUTORS.txt
 */

// Const
const env = typeof window !== "undefined" ? window : global,
    XP    = env.XP || require('expandjs');

/*********************************************************************/

// Function
function validate(field, value, options) {

    // Let
    let validator = XP.isVoid(options.index) && field.list ? 'list' : 'type',
        error     = module.exports.validators[validator](value, field[validator], options.path);

    // Throwing
    if (error) { throw error; }

    // Validating
    Object.keys(field).forEach(validator => {
        if (!module.exports.validators[validator] || ['list', 'type'].includes(validator) || (validator === 'statement' && !options.current)) { return; }
        if (XP.isTruthy(error = module.exports.validators[validator](value, field[validator], options.path, options.memento))) { throw error; }
    });

    return value;
}

/*********************************************************************/

// Exporting
module.exports = function (schema, item, options) {

    // Validating
    Object.keys(schema.fields || {}).forEach(key => {

        // Let
        let alias   = schema.fields[key].alias || key,
            field   = schema.fields[key],
            path    = options.path ? `${options.path}.${alias}` : alias,
            memento = options.current && options.current[alias];

        // Validating (value)
        validate(field, item[alias], {current: options.current, memento: memento, path: path});

        // Validating (sub fields)
        if (!field.list) { return XP.isObject(item[alias]) && module.exports(field.recursive ? schema : field, item[alias], {current: memento, path: path}); }

        // Validating (sub values)
        if (XP.isArray(item[alias])) {
            item[alias].forEach((value, index) => {
                validate(field, value, {current: options.current, memento: memento && memento[index], path: `${path}.${index}`, index: index});
                return XP.isObject(value) && module.exports(field.recursive ? schema : field, value, {current: memento && memento[index], path: `${path}.${index}`});
            });
        }
    });

    return item;
};

/*********************************************************************/

// Types
module.exports.types = {
    boolean: XP.isBoolean,
    date: XP.isDate,
    number: XP.isFinite,
    object: XP.isObject,
    recursive: XP.isObject,
    string: XP.isString,
    uuid: XP.isUUID
};

/*********************************************************************/

// Validators
module.exports.validators = {

    /**
     * Returns error if value is not a list, according to bool.
     *
     * @param {*} value
     * @param {boolean} bool
     * @param {string} [path]
     * @returns {boolean | Error}
     */
    list(value, bool, path) {
        if (bool && !XP.isArray(value)) { return XP.error(400, `${path ? `"${path}"` : `item`} must be a list.`); }
        return null;
    },

    /**
     * Returns error if value is gt max.
     *
     * @param {number} value
     * @param {number} max
     * @param {string} [path]
     * @returns {boolean | Error}
     */
    max(value, max, path) {
        if (!XP.isFinite(value) || !XP.isFinite(max)) { return false; }
        if (value > max) { return XP.error(400, `${path ? `"${path}"` : `item`} must be up to ${max}.`); }
        return null;
    },

    /**
     * Returns error if value is gt max.
     *
     * @param {Date} value
     * @param {Date} max
     * @param {string} [path]
     * @returns {boolean | Error}
     */
    maxDate(value, max, path) {
        if (!XP.isDefined(value = XP.toDate(value)) || !XP.isDefined(max = XP.toDate(max))) { return false; }
        if (value > max) { return XP.error(400, `${path ? `"${path}"` : `item`} must be up to ${XP.toDate(max).toISOString()}.`); }
        return null;
    },

    /**
     * Returns error if value is gte max.
     *
     * @param {number} value
     * @param {number} max
     * @param {string} [path]
     * @returns {boolean | Error}
     */
    maxExclusive(value, max, path) {
        if (!XP.isFinite(value) || !XP.isFinite(max)) { return false; }
        if (value >= max) { return XP.error(400, `${path ? `"${path}"` : `item`} must be lower than ${max}.`); }
        return null;
    },

    /**
     * Returns error if value is gte max.
     *
     * @param {Date} value
     * @param {Date} max
     * @param {string} [path]
     * @returns {boolean | Error}
     */
    maxExclusiveDate(value, max, path) {
        if (!XP.isDefined(value = XP.toDate(value)) || !XP.isDefined(max = XP.toDate(max))) { return false; }
        if (value >= max) { return XP.error(400, `${path ? `"${path}"` : `item`} must be lower than ${XP.toDate(max).toISOString()}.`); }
        return null;
    },

    /**
     * Returns error if value length is gt max.
     *
     * @param {Array} value
     * @param {number} max
     * @param {string} [path]
     * @returns {boolean | Error}
     */
    maxItems(value, max, path) {
        if (!XP.isArray(value, true) || !XP.isFinite(max) || max < 1) { return false; }
        if (value.length > max) { return XP.error(400, `${path ? `"${path}"` : `item`} must be up to ${max} items.`); }
        return null;
    },

    /**
     * Returns error if value length is gt max.
     *
     * @param {string} value
     * @param {number} max
     * @param {string} [path]
     * @returns {boolean | Error}
     */
    maxLength(value, max, path) {
        if (!XP.isString(value) || !XP.isFinite(max) || max < 1) { return false; }
        if (value.length > max) { return XP.error(400, `${path ? `"${path}"` : `item`} must be up to ${max} chars.`); }
        return null;
    },

    /**
     * Returns error if value is lt min.
     *
     * @param {number} value
     * @param {number} min
     * @param {string} [path]
     * @returns {boolean | Error}
     */
    min(value, min, path) {
        if (!XP.isFinite(value) || !XP.isFinite(min)) { return false; }
        if (value < min) { return XP.error(400, `${path ? `"${path}"` : `item`} must be at least ${min}.`); }
        return null;
    },

    /**
     * Returns error if value is lt min.
     *
     * @param {Date} value
     * @param {Date} min
     * @param {string} [path]
     * @returns {boolean | Error}
     */
    minDate(value, min, path) {
        if (!XP.isDefined(value = XP.toDate(value)) || !XP.isDefined(min = XP.toDate(min))) { return false; }
        if (value < min) { return XP.error(400, `${path ? `"${path}"` : `item`} must be at least ${XP.toDate(min).toISOString()}.`); }
        return null;
    },

    /**
     * Returns error if value is lte min.
     *
     * @param {number} value
     * @param {number} min
     * @param {string} [path]
     * @returns {boolean | Error}
     */
    minExclusive(value, min, path) {
        if (!XP.isFinite(value) || !XP.isFinite(min)) { return false; }
        if (value <= min) { return XP.error(400, `${path ? `"${path}"` : `item`} must be greater than ${min}.`); }
        return null;
    },

    /**
     * Returns error if value is lte min.
     *
     * @param {Date} value
     * @param {Date} min
     * @param {string} [path]
     * @returns {boolean | Error}
     */
    minExclusiveDate(value, min, path) {
        if (!XP.isDefined(value = XP.toDate(value)) || !XP.isDefined(min = XP.toDate(min))) { return false; }
        if (value <= min) { return XP.error(400, `${path ? `"${path}"` : `item`} must be greater than ${XP.toDate(min).toISOString()}.`); }
        return null;
    },

    /**
     * Returns error if value length is lt min.
     *
     * @param {Array} value
     * @param {number} min
     * @param {string} [path]
     * @returns {boolean | Error}
     */
    minItems(value, min, path) {
        if (!XP.isArray(value, true) || !XP.isFinite(min) || min < 1) { return false; }
        if (value.length < min) { return XP.error(400, `${path ? `"${path}"` : `item`} must be at least ${min} items.`); }
        return null;
    },

    /**
     * Returns error if value length is lt min.
     *
     * @param {string} value
     * @param {number} min
     * @param {string} [path]
     * @returns {boolean | Error}
     */
    minLength(value, min, path) {
        if (!XP.isString(value) || !XP.isFinite(min)) { return false; }
        if (value.length < min) { return XP.error(400, `${path ? `"${path}"` : `item`} must be at least ${min} chars.`); }
        return null;
    },

    /**
     * Returns error if value length is lt min.
     *
     * @param {*} value
     * @param {Array} opts
     * @param {string} [path]
     * @returns {boolean | Error}
     */
    options(value, opts, path) {
        if (!XP.isUseful(value) || !XP.isPrimitive(value) || !XP.isArray(opts, true)) { return false; }
        if (!opts.includes(value)) { return XP.error(400, `${path ? `"${path}"` : `item`} is not valid.`); }
        return null;
    },

    /**
     * Returns error if value matches pattern.
     *
     * @param {string} value
     * @param {string} pattern
     * @param {string} [path]
     * @returns {boolean | Error}
     */
    pattern(value, pattern, path) {
        if (!XP.isString(value) || (!XP.isString(pattern, true) && !XP.isRegExp(pattern))) { return false; }
        if (!XP.isVoid(pattern = XP.toRegExp(pattern)) && !pattern.test(value)) { return XP.error(400, `${path ? `"${path}"` : `item`} is not valid.`); }
        return null;
    },

    /**
     * Returns error if value is empty, according to bool.
     *
     * @param {*} value
     * @param {boolean} bool
     * @param {string} [path]
     * @returns {boolean | Error}
     */
    required(value, bool, path) {
        if (bool && (!XP.isUseful(value) || XP.isFalse(value) || XP.isArray(value, false))) { return XP.error(400, `${path ? `"${path}"` : `item`} must be set.`); }
        return null;
    },

    /**
     * Returns error if value is not equivalent to current, according to statement.
     *
     * @param {*} value
     * @param {string} statement
     * @param {string} [path]
     * @param {*} [current]
     */
    statement(value, statement, path, current) {
        if (statement === 'const' && !XP.isEquivalent(value, current)) { return XP.error(409, `${path ? `"${path}"` : `item`} is immutable.`); }
        if (statement === 'final' && !XP.isVoid(current) && !XP.isEquivalent(value, current)) { return XP.error(409, `${path ? `"${path}"` : `item`} isn't rewritable.`); }
        return null;
    },

    /**
     * Returns error if value is not multiple of val.
     *
     * @param {number} value
     * @param {number} val
     * @param {string} [path]
     * @returns {boolean | Error}
     */
    step(value, val, path) {
        if (!XP.isFinite(value) || !XP.isFinite(val)) { return false; }
        if (value % val !== 0) { return XP.error(400, `${path ? `"${path}"` : `item`} must be divisible by ${val}.`); }
        return null;
    },

    /**
     * Returns error if value type is not correct.
     *
     * @param {*} value
     * @param {string} type
     * @param {string} [path]
     * @returns {boolean | Error}
     */
    type(value, type, path) {
        if (module.exports.types[type] && !module.exports.types[type](value) && !XP.isVoid(value)) { return XP.error(400, `${path ? `"${path}"` : `item`} must be ${type}.`); }
        return null;
    },

    /**
     * Returns error if value includes duplicates, according to bool.
     *
     * @param {Array} value
     * @param {boolean} bool
     * @param {string} [path]
     * @returns {boolean | Error}
     */
    unique(value, bool, path) {
        if (!XP.isArray(value)) { return false; }
        if (bool && !XP.isUniq(value)) { return XP.error(400, `${path ? `"${path}"` : `item`} must be duplicates free.`); }
        return null;
    }
};
