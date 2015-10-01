/*jslint browser: true, devel: true, node: true, ass: true, nomen: true, unparam: true, indent: 4 */

/**
 * @license
 * Copyright (c) 2015 The ExpandJS authors. All rights reserved.
 * This code may only be used under the BSD style license found at https://expandjs.github.io/LICENSE.txt
 * The complete set of authors may be found at https://expandjs.github.io/AUTHORS.txt
 * The complete set of contributors may be found at https://expandjs.github.io/CONTRIBUTORS.txt
 */
(function (global) {
    "use strict";

    // Vars
    var exp = module.exports,
        XP  = global.XP || require('expandjs');

    /*********************************************************************/

    /**
     * Validates the data.
     *
     * @param {Object} data
     * @param {Object} fields
     * @param {Object} [options]
     * @param {string} [name]
     * @returns {Object}
     */
    exp = module.exports = function (data, fields, options, name) {

        // Validating
        XP.forOwn(fields, function (field, key) {
            exp.validateStep(data[key], field, fields, options, (name ? name + '.' : '') + key);
        });

        return data;
    };

    /**
     * Validates the step.
     *
     * @param {*} step
     * @param {Object} [field]
     * @param {Object} [fields]
     * @param {Object} [options]
     * @param {string} [name]
     * @returns {*}
     */
    exp.validateStep = function (step, field, fields, options, name) {

        // Setting
        step = XP.isDefined(step) ? step : null;

        // Checking
        if (!XP.isObject(field)) { return step; }

        // Validating (step)
        exp.validateValue(step, field, null, name);

        // Validating (values)
        if (field.map || field.multi) {
            XP[field.map ? 'forOwn' : 'forEach'](step, function (value, index) {
                exp.validateValue(value, field, index, name + '[' + index + ']');
                if (XP.isObject(value) && (field.fields || field.type === 'recursive')) {
                    exp(value, field.fields || fields, XP.assign({}, options, {strict: field.strict}), name + '[' + index + ']');
                }
            });
        } else if (XP.isObject(step) && (field.fields || field.type === 'recursive')) {
            exp(step, field.fields || fields, XP.assign({}, options, {strict: field.strict}), name);
        }

        return step;
    };

    /**
     * Validates the value.
     *
     * @param {*} value
     * @param {Object} [field]
     * @param {number | string} [index]
     * @param {string} [name]
     * @returns {*}
     */
    exp.validateValue = function (value, field, index, name) {

        // Setting
        value = XP.isDefined(value) ? value : null;

        // Vars
        var key = (XP.isVoid(index) && ((field.map && 'map') || (field.multi && 'multi'))) || 'type',
            err = exp.validators[key].method(value, field[key], name);

        // Throwing
        if (err) { throw err; }

        // Validating
        XP.forOwn(field, function (sub, key) {
            if (!exp.validators[key] || key === 'map' || key === 'multi' || key === 'type') { return; }
            if (err = exp.validators[key].method(value, sub, name)) { throw err; }
        });

        return value;
    };

    /*********************************************************************/

    /**
     * The available patterns.
     *
     * @property patterns
     * @type Object
     */
    exp.patterns = {
        camelCase: XP.camelCaseRegex,
        capitalize: XP.capitalizeRegex,
        kebabCase: XP.kebabCaseRegex,
        keyCase: XP.keyCaseRegex,
        lowerCase: XP.lowerCaseRegex,
        snakeCase: XP.snakeCaseRegex,
        startCase: XP.startCaseRegex,
        trim: XP.trimRegex,
        upperCase: XP.upperCaseRegex,
        uuid: XP.uuidRegex
    };

    /**
     * The available types.
     *
     * @property types
     * @type Object
     */
    exp.types = {
        any: XP.isAny,
        boolean: XP.isBoolean,
        input: XP.isInput,
        number: XP.isFinite,
        object: XP.isObject,
        recursive: XP.isObject,
        string: XP.isString
    };

    /**
     * The available validators.
     *
     * @property validators
     * @type Object
     */
    exp.validators = {

        /**
         * Returns error if value is gte than max
         *
         * @param {number} value
         * @param {number} max
         * @param {string} [name]
         * @returns {boolean | Error | null}
         */
        exclusiveMaximum: {input: 'number', type: 'number', method: function (value, max, name) {
            return !XP.isFinite(value) || !XP.isFinite(max) ? false : (value >= max ? new XP.ValidationError(name || 'data', 'less than ' + max, 400) : null);
        }},

        /**
         * Returns error if value is lte than min
         *
         * @param {number} value
         * @param {number} min
         * @param {string} [name]
         * @returns {boolean | Error | null}
         */
        exclusiveMinimum: {input: 'number', type: 'number', method: function (value, min, name) {
            return !XP.isFinite(value) || !XP.isFinite(min) ? false : (value <= min ? new XP.ValidationError(name || 'data', 'greater than ' + min, 400) : null);
        }},

        /**
         * Returns error if value is not an map (based on bool)
         *
         * @param {*} value
         * @param {boolean} bool
         * @param {string} [name]
         * @returns {boolean | Error | null}
         */
        map: {input: 'checkbox', multi: true, method: function (value, bool, name) {
            return XP.xor(bool, XP.isObject(value)) ? new XP.ValidationError(name || 'data', 'a map', 400) : null;
        }},

        /**
         * Returns error if value is gt than max
         *
         * @param {number} value
         * @param {number} max
         * @param {string} [name]
         * @returns {boolean | Error | null}
         */
        maximum: {input: 'number', type: 'number', method: function (value, max, name) {
            return !XP.isFinite(value) || !XP.isFinite(max) ? false : (value > max ? new XP.ValidationError(name || 'data', 'a maximum of ' + max, 400) : null);
        }},

        /**
         * Returns error if value length is gt than max
         *
         * @param {Array} value
         * @param {number} max
         * @param {string} [name]
         * @returns {boolean | Error | null}
         */
        maxItems: {attributes: {min: 1}, input: 'number', multi: true, method: function (value, max, name) {
            return !XP.isArray(value) || !XP.isFinite(max) || max < 1 ? false : (value.length > max ? new XP.ValidationError(name || 'data', 'a maximum of ' + max + ' items', 400) : null);
        }},

        /**
         * Returns error if value length is gt than max
         *
         * @param {string} value
         * @param {number} max
         * @param {string} [name]
         * @returns {boolean | Error | null}
         */
        maxLength: {attributes: {min: 1}, input: 'number', type: 'string', method: function (value, max, name) {
            return !XP.isString(value) || !XP.isFinite(max) || max < 1 ? false : (value.length > max ? new XP.ValidationError(name || 'data', 'a maximum of ' + max + ' chars', 400) : null);
        }},

        /**
         * Returns error if value is lt than min
         *
         * @param {number} value
         * @param {number} min
         * @param {string} [name]
         * @returns {boolean | Error|null}
         */
        minimum: {input: 'number', type: 'number', method: function (value, min, name) {
            return !XP.isFinite(value) || !XP.isFinite(min) ? false : (value < min ? new XP.ValidationError(name || 'data', 'a minimum of ' + min, 400) : null);
        }},

        /**
         * Returns error if value length is lt than min
         *
         * @param {Array} value
         * @param {number} min
         * @param {string} [name]
         * @returns {boolean | Error | null}
         */
        minItems: {attributes: {min: 1}, input: 'number', multi: true, method: function (value, min, name) {
            return !XP.isArray(value) || !XP.isFinite(min) ? false : (value.length < min ? new XP.ValidationError(name || 'data', 'a minimum of ' + min + ' items', 400) : null);
        }},

        /**
         * Returns error if value length is lt than min
         *
         * @param {string} value
         * @param {number} min
         * @param {string} [name]
         * @returns {boolean | Error|null}
         */
        minLength: {attributes: {min: 1}, input: 'number', type: 'string', method: function (value, min, name) {
            return !XP.isString(value) || !XP.isFinite(min) ? false : (value.length < min ? new XP.ValidationError(name || 'data', 'a minimum of ' + min + ' chars', 400) : null);
        }},

        /**
         * Returns error if value is not array (based on bool)
         *
         * @param {*} value
         * @param {boolean} bool
         * @param {string} [name]
         * @returns {boolean | Error | null}
         */
        multi: {input: 'checkbox', method: function (value, bool, name) {
            return XP.xor(bool, XP.isArray(value)) ? new XP.ValidationError(name || 'data', 'multi', 400) : null;
        }},

        /**
         * Returns error if value is not multiple of val
         *
         * @param {number} value
         * @param {number} val
         * @param {string} [name]
         * @returns {boolean | Error | null}
         */
        multipleOf: {input: 'number', type: 'number', method: function (value, val, name) {
            return !XP.isFinite(value) || !XP.isFinite(val) ? false : (value % val !== 0 ? new XP.ValidationError(name || 'data', 'divisible by ' + val, 400) : null);
        }},

        /**
         * Returns error if value matches pattern
         *
         * @param {string} value
         * @param {string} pattern
         * @param {string} [name]
         * @returns {boolean | Error | null}
         */
        pattern: {input: 'text', options: XP.keys(exp.patterns), type: 'string', method: function (value, pattern, name) {
            var reg = XP.isString(value) && XP.isString(pattern, true) && (exp.patterns[pattern] || pattern);
            if (XP.isString(reg) && XP.isRegExp(reg = XP.toRegExp(pattern))) { exp.patterns[pattern] = reg; }
            return !reg ? false : (!reg.test(value) ? new XP.InvalidError(name || 'data', 400) : null);
        }},

        /**
         * Returns error if value is empty (based on bool)
         *
         * @param {*} value
         * @param {boolean} bool
         * @param {string} [name]
         * @returns {boolean | Error | null}
         */
        required: {input: 'checkbox', method: function (value, bool, name) {
            return bool && XP.isEmpty(value) ? new XP.RequiredError(name || 'data', 400) : null;
        }},

        /**
         * Returns error if value type is not correct
         *
         * @param {*} value
         * @param {string} type
         * @param {string} [name]
         * @returns {boolean | Error|null}
         */
        type: {attributes: {required: true}, options: XP.keys(exp.types), method: function (value, type, name) {
            return XP.has(exp.types, type || 'any') && !exp.types[type || 'any'](value) && !XP.isNull(value) ? new XP.ValidationError(name || 'data', type || 'any', 400) : null;
        }},

        /**
         * Returns error if value includes duplicates (based on bool)
         *
         * @param {Array} value
         * @param {boolean} bool
         * @param {string} [name]
         * @returns {boolean | Error | null}
         */
        uniqueItems: {input: 'checkbox', multi: true, method: function (value, bool, name) {
            return !XP.isArray(value) ? false : (bool && !XP.isUniq(value) ? new XP.ValidationError(name || 'data', 'should not have duplicates', 400) : null);
        }}
    };

}(typeof window !== "undefined" ? window : global));