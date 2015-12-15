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
     * @param {Object} [item]
     * @param {string} [name]
     * @returns {Object}
     */
    exp = module.exports = function (data, fields, item, name) {

        // Trying
        try {

            // Validating
            XP.forOwn(fields, function (field, key) {
                validateStep(data[key], fields, item, (name ? name + '.' : '') + key, key);
            });

            return null;
        }

        // Catching
        catch (error) { return error; }
    };

    /**
     * Validates the step.
     *
     * @param {*} step
     * @param {Object} [fields]
     * @param {Object} [item]
     * @param {string} [name]
     * @param {string} [key]
     * @throws Error
     */
    function validateStep(step, fields, item, name, key) {

        // Setting
        step = XP.isDefined(step) ? step : null;

        // Checking
        if (!XP.isObject(fields[key]) && !XP.isString(fields[key], true)) { return; }

        // Validating (step)
        validateValue(step, fields, item, name, key);

        // Validating (values)
        if (fields[key].multi === 'list' || fields[key].multi === 'map') {
            XP[fields[key].multi === 'list' ? 'forEach' : 'forOwn'](step, function (value, index) {
                validateValue(value, fields, item, name + '[' + index + ']', key, index);
                if (XP.isObject(value) && (fields[key].fields || fields[key].type === 'recursive')) {
                    exp(value, fields[key].fields || fields, item, name + '[' + index + ']');
                }
            });
        } else if (XP.isObject(step) && (fields[key].fields || fields[key].type === 'recursive')) {
            exp(step, fields[key].fields || fields, item, name);
        }
    }

    /**
     * Validates the value.
     *
     * @param {*} value
     * @param {Object} [fields]
     * @param {Object} [item]
     * @param {string} [name]
     * @param {string} [key]
     * @param {number | string} [index]
     * @throws Error
     */
    function validateValue(value, fields, item, name, key, index) {

        // Setting
        value = XP.isDefined(value) ? value : null;

        // Vars
        var field     = XP.isString(fields[key]) ? {type: fields[key]} : fields[key],
            validator = XP.isVoid(index) && (field.multi === 'list' || field.multi === 'map') ? 'multi' : 'type',
            error     = exp.validators[validator].method(value, field[validator], name);

        // Throwing
        if (error) { throw error; }

        // Validating
        XP.forOwn(field, function (match, validator) {
            if (exp.validators[validator] && validator !== 'multi' && validator !== 'type' && (validator !== 'immutable' || item)) {
                if (error = exp.validators[validator].method(value, match, name, item && item[key])) { throw error; }
            }
        });
    }

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
        boolean: XP.isBoolean,
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
         * Returns error if value is gte than max.
         *
         * @param {number} value
         * @param {number} max
         * @param {string} [name]
         * @returns {boolean | Error}
         */
        exclusiveMaximum: {input: 'number', type: 'number', method: function (value, max, name) {
            if (!XP.isFinite(value) || !XP.isFinite(max)) { return false; }
            if (value >= max) { return new XP.ValidationError(name || 'data', 'less than ' + max, 400); }
            return null;
        }},

        /**
         * Returns error if value is lte than min.
         *
         * @param {number} value
         * @param {number} min
         * @param {string} [name]
         * @returns {boolean | Error}
         */
        exclusiveMinimum: {input: 'number', type: 'number', method: function (value, min, name) {
            if (!XP.isFinite(value) || !XP.isFinite(min)) { return false; }
            if (value <= min) { return new XP.ValidationError(name || 'data', 'greater than ' + min, 400); }
            return null;
        }},

        /**
         * Returns error if value is not equivalent to current (based on bool).
         *
         * @param {*} value
         * @param {boolean} bool
         * @param {string} [name]
         * @param {*} [current]
         */
        immutable: {input: 'checkbox', method: function (value, bool, name, current) {
            if (bool && !XP.isEquivalent(value, current)) { return new XP.ImmutableError(name || 'data', 409); }
            return null;
        }},

        /**
         * Returns error if value is gt than max.
         *
         * @param {number} value
         * @param {number} max
         * @param {string} [name]
         * @returns {boolean | Error}
         */
        maximum: {input: 'number', type: 'number', method: function (value, max, name) {
            if (!XP.isFinite(value) || !XP.isFinite(max)) { return false; }
            if (value > max) { return new XP.ValidationError(name || 'data', 'a maximum of ' + max, 400); }
            return null;
        }},

        /**
         * Returns error if value length is gt than max.
         *
         * @param {Array} value
         * @param {number} max
         * @param {string} [name]
         * @returns {boolean | Error}
         */
        maxItems: {attributes: {min: 1}, input: 'number', multi: true, method: function (value, max, name) {
            if (!XP.isArray(value) || !XP.isFinite(max) || max < 1) { return false; }
            if (value.length > max) { return new XP.ValidationError(name || 'data', 'a maximum of ' + max + ' items', 400); }
            return null;
        }},

        /**
         * Returns error if value length is gt than max.
         *
         * @param {string} value
         * @param {number} max
         * @param {string} [name]
         * @returns {boolean | Error}
         */
        maxLength: {attributes: {min: 1}, input: 'number', type: 'string', method: function (value, max, name) {
            if (!XP.isString(value) || !XP.isFinite(max) || max < 1) { return false; }
            if (value.length > max) { return new XP.ValidationError(name || 'data', 'a maximum of ' + max + ' chars', 400); }
            return null;
        }},

        /**
         * Returns error if value is lt than min.
         *
         * @param {number} value
         * @param {number} min
         * @param {string} [name]
         * @returns {boolean | Error|null}
         */
        minimum: {input: 'number', type: 'number', method: function (value, min, name) {
            if (!XP.isFinite(value) || !XP.isFinite(min)) { return false; }
            if (value < min) { return new XP.ValidationError(name || 'data', 'a minimum of ' + min, 400); }
            return null;
        }},

        /**
         * Returns error if value length is lt than min.
         *
         * @param {Array} value
         * @param {number} min
         * @param {string} [name]
         * @returns {boolean | Error}
         */
        minItems: {attributes: {min: 1}, input: 'number', multi: true, method: function (value, min, name) {
            if (!XP.isArray(value) || !XP.isFinite(min)) { return false; }
            if (value.length < min) { return new XP.ValidationError(name || 'data', 'a minimum of ' + min + ' items', 400); }
            return null;
        }},

        /**
         * Returns error if value length is lt than min.
         *
         * @param {string} value
         * @param {number} min
         * @param {string} [name]
         * @returns {boolean | Error|null}
         */
        minLength: {attributes: {min: 1}, input: 'number', type: 'string', method: function (value, min, name) {
            if (!XP.isString(value) || !XP.isFinite(min)) { return false; }
            if (value.length < min) { return new XP.ValidationError(name || 'data', 'a minimum of ' + min + ' chars', 400); }
            return null;
        }},

        /**
         * Returns error if value is not array (based on bool).
         *
         * @param {*} value
         * @param {string} type
         * @param {string} [name]
         * @returns {boolean | Error}
         */
        multi: {options: ['none', 'list', 'map'], method: function (value, type, name) {
            if (type === 'list' && !XP.isArray(value)) { return new XP.ValidationError(name || 'data', 'a list', 400); }
            if (type === 'map' && !XP.isObject(value)) { return new XP.ValidationError(name || 'data', 'a map', 400); }
            return null;
        }},

        /**
         * Returns error if value is not multiple of val.
         *
         * @param {number} value
         * @param {number} val
         * @param {string} [name]
         * @returns {boolean | Error}
         */
        multipleOf: {input: 'number', type: 'number', method: function (value, val, name) {
            if (!XP.isFinite(value) || !XP.isFinite(val)) { return false; }
            if (value % val !== 0) { return new XP.ValidationError(name || 'data', 'divisible by ' + val, 400); }
            return null;
        }},

        /**
         * Returns error if value matches pattern.
         *
         * @param {string} value
         * @param {string} pattern
         * @param {string} [name]
         * @returns {boolean | Error}
         */
        pattern: {input: 'text', options: XP.keys(exp.patterns), type: 'string', method: function (value, pattern, name) {
            var reg = XP.isString(value) && XP.isString(pattern, true) && (exp.patterns[pattern] || pattern);
            if (XP.isString(reg) && XP.isRegExp(reg = XP.toRegExp(pattern))) { exp.patterns[pattern] = reg; }
            if (reg && !reg.test(value)) { return new XP.InvalidError(name || 'data', 400); }
            return null;
        }},

        /**
         * Returns error if value is empty (based on bool).
         *
         * @param {*} value
         * @param {boolean} bool
         * @param {string} [name]
         * @returns {boolean | Error}
         */
        required: {input: 'checkbox', method: function (value, bool, name) {
            if (bool && XP.isEmpty(value)) { return new XP.RequiredError(name || 'data', 400); }
            return null;
        }},

        /**
         * Returns error if value type is not correct.
         *
         * @param {*} value
         * @param {string} type
         * @param {string} [name]
         * @returns {boolean | Error}
         */
        type: {attributes: {required: true}, options: XP.keys(exp.types), method: function (value, type, name) {
            if (exp.types[type] && !exp.types[type](value) && !XP.isVoid(value)) { return new XP.ValidationError(name || 'data', type || 'any', 400); }
            return null;
        }},

        /**
         * Returns error if value includes duplicates (based on bool).
         *
         * @param {Array} value
         * @param {boolean} bool
         * @param {string} [name]
         * @returns {boolean | Error}
         */
        uniqueItems: {input: 'checkbox', multi: true, method: function (value, bool, name) {
            if (!XP.isArray(value)) { return false; }
            if (bool && !XP.isUniq(value)) { return new XP.ValidationError(name || 'data', 'should not have duplicates', 400); }
            return null;
        }}
    };

}(typeof window !== "undefined" ? window : global));
