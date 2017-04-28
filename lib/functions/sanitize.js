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
function sanitize(field, value, options) {

    // Let
    let sanitizer = XP.isVoid(options.index) && field.list ? 'list' : 'type',
        result    = module.exports.sanitizers[sanitizer](XP.toUseful(value, true), field[sanitizer]),
        error     = module.exports.validators[sanitizer](result, field[sanitizer], options.path);

    // Throwing
    if (error) { throw error; }

    return result;
}

/*********************************************************************/

// Exporting
module.exports = function (schema, item, options) {

    // Sanitizing
    Object.keys(schema.fields || {}).forEach(key => {

        // Let
        let alias   = schema.fields[key].alias || key,
            field   = schema.fields[key],
            path    = options.path ? `${options.path}.${alias}` : alias,
            memento = options.current && options.current[alias];

        // Sanitizing (value)
        item[alias] = sanitize(field, options.current || XP.isUseful(item[alias]) || !XP.isUseful(field.value) ? item[alias] : (XP.isFunction(field.value) ? field.value() : field.value), {path: path});

        // Sanitizing (sub fields)
        if (!field.list) { return XP.isObject(item[alias]) && (item[alias] = module.exports(field.recursive ? schema : field, item[alias], {current: memento, path: path})); }

        // Sanitizing (sub values)
        if (XP.isArray(item[alias])) {
            item[alias].forEach((value, index) => {
                item[alias][index] = value = sanitize(field, value, {path: `${path}.${index}`, index: index});
                return XP.isObject(value) && (item[alias][index] = module.exports(field.recursive ? schema : field, value, {current: memento && memento[index], path: `${path}.${index}`}));
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

// Sanitizers
module.exports.sanitizers = {

    /**
     * Returns list representation of value, according to bool
     *
     * @param {*} value
     * @param {boolean} bool
     * @returns {*}
     */
    list(value, bool) {
        if (bool && XP.isVoid(value)) { return []; }
        if (bool && XP.isString(value)) { return value.split(','); }
        if (bool && !XP.isArray(value)) { return [value]; }
        return value;
    },

    /**
     * Returns typed representation of value
     *
     * @param {*} value
     * @param {string} type
     * @returns {*}
     */
    type(value, type) {
        let casted = XP.isDefined(value) && ['boolean', 'date', 'number', 'string'].includes(type) ? XP.toPrimitive(value, type, true) : value;
        if (XP.isDefined(casted)) { return casted !== null || type !== 'boolean' ? casted : false; }
        if (XP.isDefined(value)) { return value !== null || type !== 'boolean' ? value : false; }
        return type !== 'boolean' ? null : false;
    }
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
        if (bool && !XP.isArray(value)) { return XP.error(400, `${path ? `"${path}"` : 'item'} must be a list`); }
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
        if (module.exports.types[type] && !module.exports.types[type](value) && !XP.isVoid(value)) { return XP.error(400, `${path ? `"${path}"` : 'item'} must be ${type}`); }
        return null;
    }
};
