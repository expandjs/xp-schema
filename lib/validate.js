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
     * Validates the target
     *
     * @param {Object} target
     * @param {Object} fields
     * @param {Object} [options]
     * @param {string} [name]
     * @returns {Object}
     */
    exp = module.exports = function (target, fields, options, name) {

        // Checking
        if (!XP.isObject(fields)) { return target; }

        // Validating
        XP.forOwn(fields, function (field, key) {
            exp.validateStep(target[key], field, fields, options, (name ? name + '.' : '') + key);
        });

        return target;
    };

    /**
     * Validates the step
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
     * Validates the value
     *
     * @param {*} value
     * @param {Object} [field]
     * @param {number | string} [index]
     * @param {string} [name]
     * @returns {*}
     */
    exp.validateValue = function (value, field, index, name) {

        // Vars
        var err;

        // Setting
        value = XP.isDefined(value) ? value : null;

        // Checking
        if (!XP.isObject(field)) { return value; }

        // Validating (type)
        if (field.map && XP.isVoid(index)) {
            if (XP.isError(err = exp.validators.map.method(value, field.map, name))) { throw err; }
        } else if (field.multi && XP.isVoid(index)) {
            if (XP.isError(err = exp.validators.multi.method(value, field.multi, name))) { throw err; }
        } else {
            if (XP.isError(err = exp.validators.type.method(value, field.type, name))) { throw err; }
        }

        // Validating (other)
        XP.forOwn(field, function (val, key) {
            if (exp.validators[key] && !XP.includes(['map', 'multi', 'type'], key)) {
                if (XP.isError(err = exp.validators[key].method(value, field[key], name))) { throw err; }
            }
        });

        return value;
    };

    /*********************************************************************/

    /**
     * TODO DOC
     *
     * @property patterns
     * @type Object
     * @private
     */
    exp.patterns = {
        camelCase: XP.camelCaseRegex,
        capitalize: XP.capitalizeRegex,
        kebabCase: XP.kebabCaseRegex,
        keyCase: XP.keyCaseRegex,
        lowerCase: XP.lowerCaseRegex,
        readable: XP.readableRegex,
        snakeCase: XP.snakeCaseRegex,
        startCase: XP.startCaseRegex,
        trim: XP.trimRegex,
        upperCase: XP.upperCaseRegex
    };

    /**
     * TODO DOC
     *
     * @property types
     * @type Object
     * @private
     */
    exp.types = {
        any: XP.isAny,
        boolean: XP.isBoolean,
        number: XP.isFinite,
        object: XP.isObject,
        recursive: XP.isObject,
        string: XP.isString
    };

    /**
     * TODO DOC
     *
     * @property validators
     * @type Object
     * @private
     */
    exp.validators = {

        /**
         * Returns error if target is not array (based on bool)
         *
         * @param {*} target
         * @param {boolean} bool
         * @param {string} [name]
         * @returns {boolean | Error | null}
         * @private
         */
        multi: {input: 'checkbox', method: function (target, bool, name) {
            return XP.xor(bool, XP.isArray(target)) ? new XP.ValidationError(name || 'target', 'should be a multi') : null;
        }},

        /**
         * Returns error if target is not an map (based on bool)
         *
         * @param {*} target
         * @param {boolean} bool
         * @param {string} [name]
         * @returns {boolean | Error | null}
         * @private
         */
        map: {input: 'checkbox', multi: true, method: function (target, bool, name) {
            return XP.xor(bool, XP.isObject(target)) ? new XP.ValidationError(name || 'target', 'should be an map') : null;
        }},

        /**
         * Returns error if target is gte than max
         *
         * @param {number} target
         * @param {number} max
         * @param {string} [name]
         * @returns {boolean | Error | null}
         * @private
         */
        exclusiveMaximum: {input: 'number', type: 'number', method: function (target, max, name) {
            return !XP.isFinite(target) || !XP.isFinite(max) ? false : (target >= max ? new XP.ValidationError(name || 'target', 'should be less than ' + max) : null);
        }},

        /**
         * Returns error if target is lte than min
         *
         * @param {number} target
         * @param {number} min
         * @param {string} [name]
         * @returns {boolean | Error | null}
         * @private
         */
        exclusiveMinimum: {input: 'number', type: 'number', method: function (target, min, name) {
            return !XP.isFinite(target) || !XP.isFinite(min) ? false : (target <= min ? new XP.ValidationError(name || 'target', 'should be greater than ' + min) : null);
        }},

        /**
         * Returns error if target is gt than max
         *
         * @param {number} target
         * @param {number} max
         * @param {string} [name]
         * @returns {boolean | Error | null}
         * @private
         */
        maximum: {input: 'number', type: 'number', method: function (target, max, name) {
            return !XP.isFinite(target) || !XP.isFinite(max) ? false : (target > max ? new XP.ValidationError(name || 'target', 'should be a maximum of ' + max) : null);
        }},

        /**
         * Returns error if target length is gt than max
         *
         * @param {Array} target
         * @param {number} max
         * @param {string} [name]
         * @returns {boolean | Error | null}
         * @private
         */
        maxItems: {attributes: {min: 1}, input: 'number', multi: true, method: function (target, max, name) {
            return !XP.isArray(target) || !XP.isFinite(max) || max < 1 ? false : (target.length > max ? new XP.ValidationError(name || 'target', 'should be a maximum of ' + max + ' items') : null);
        }},

        /**
         * Returns error if target length is gt than max
         *
         * @param {string} target
         * @param {number} max
         * @param {string} [name]
         * @returns {boolean | Error | null}
         * @private
         */
        maxLength: {attributes: {min: 1}, input: 'number', type: 'string', method: function (target, max, name) {
            return !XP.isString(target) || !XP.isFinite(max) || max < 1 ? false : (target.length > max ? new XP.ValidationError(name || 'target', 'should be a maximum of ' + max + ' chars') : null);
        }},

        /**
         * Returns error if target is lt than min
         *
         * @param {number} target
         * @param {number} min
         * @param {string} [name]
         * @returns {boolean | Error|null}
         */
        minimum: {input: 'number', type: 'number', method: function (target, min, name) {
            return !XP.isFinite(target) || !XP.isFinite(min) ? false : (target < min ? new XP.ValidationError(name || 'target', 'should be a minimum of ' + min) : null);
        }},

        /**
         * Returns error if target length is lt than min
         *
         * @param {Array} target
         * @param {number} min
         * @param {string} [name]
         * @returns {boolean | Error | null}
         * @private
         */
        minItems: {attributes: {min: 1}, input: 'number', multi: true, method: function (target, min, name) {
            return !XP.isArray(target) || !XP.isFinite(min) ? false : (target.length < min ? new XP.ValidationError(name || 'target', 'should be a minimum of ' + min + ' items') : null);
        }},

        /**
         * Returns error if target length is lt than min
         *
         * @param {string} target
         * @param {number} min
         * @param {string} [name]
         * @returns {boolean | Error|null}
         */
        minLength: {attributes: {min: 1}, input: 'number', type: 'string', method: function (target, min, name) {
            return !XP.isString(target) || !XP.isFinite(min) ? false : (target.length < min ? new XP.ValidationError(name || 'target', 'should be a minimum of ' + min + ' chars') : null);
        }},

        /**
         * Returns error if target is not multiple of val
         *
         * @param {number} target
         * @param {number} val
         * @param {string} [name]
         * @returns {boolean | Error | null}
         * @private
         */
        multipleOf: {input: 'number', type: 'number', method: function (target, val, name) {
            return !XP.isFinite(target) || !XP.isFinite(val) ? false : (target % val !== 0 ? new XP.ValidationError(name || 'target', 'should be divisible by ' + val) : null);
        }},

        /**
         * Returns error if target matches pattern
         *
         * @param {string} target
         * @param {string} pattern
         * @param {string} [name]
         * @returns {boolean | Error | null}
         * @private
         */
        pattern: {input: 'text', options: XP.keys(exp.patterns), type: 'string', method: function (target, pattern, name) {
            var reg = XP.isString(target) && XP.isString(pattern, true) && (exp.patterns[pattern] || pattern);
            if (XP.isString(reg) && XP.isRegExp(reg = XP.toRegExp(pattern))) { exp.patterns[pattern] = reg; }
            return !reg ? false : (!reg.test(target) ? new XP.InvalidError(name || 'target') : null);
        }},

        /**
         * Returns error if target is empty (based on bool)
         *
         * @param {*} target
         * @param {boolean} bool
         * @param {string} [name]
         * @returns {boolean | Error | null}
         * @private
         */
        required: {input: 'checkbox', method: function (target, bool, name) {
            return bool && XP.isEmpty(target) ? new XP.RequiredError(name || 'target') : null;
        }},

        /**
         * Returns error if target type is not correct
         *
         * @param {*} target
         * @param {string} type
         * @param {string} [name]
         * @returns {boolean | Error|null}
         */
        type: {attributes: {required: true}, options: XP.keys(exp.types), method: function (target, type, name) {
            return XP.has(exp.types, type || 'any') && !exp.types[type || 'any'](target) && !XP.isNull(target) ? new XP.ArgumentError(name, type || 'any') : null;
        }},

        /**
         * Returns error if target includes duplicates (based on bool)
         *
         * @param {Array} target
         * @param {boolean} bool
         * @param {string} [name]
         * @returns {boolean | Error | null}
         * @private
         */
        uniqueItems: {input: 'checkbox', multi: true, method: function (target, bool, name) {
            return !XP.isArray(target) ? false : (bool && !XP.isUniq(target) ? new XP.ValidationError(name || 'target', 'should not have duplicates') : null);
        }}
    };

}(typeof window !== "undefined" ? window : global));