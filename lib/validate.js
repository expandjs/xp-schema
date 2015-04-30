/*jslint browser: true, devel: true, node: true, ass: true, nomen: true, unparam: true, indent: 4 */

/**
 * @license
 * Copyright (c) 2015 The ExpandJS authors. All rights reserved.
 * This code may only be used under the BSD style license found at https://expandjs.github.io/LICENSE.txt
 * The complete set of authors may be found at https://expandjs.github.io/AUTHORS.txt
 * The complete set of contributors may be found at https://expandjs.github.io/CONTRIBUTORS.txt
 */
(function () {
    "use strict";

    // Vars
    var exp  = module.exports,
        load = require('xp-load'),
        XP   = load(require('expandjs'), 'XP');

    /*********************************************************************/

    /**
     * Validates the target
     *
     * @param {Object} target
     * @param {Object} fields
     * @param {Object} [opt]
     * @param {string} [name]
     * @returns {Object}
     */
    exp = module.exports = function (target, fields, opt, name) {

        // Checking
        if (!XP.isObject(fields)) { return target; }

        // Validating
        XP.forOwn(fields, function (val, key) {
            exp.validateStep(target[key], fields[key], fields, opt, (name ? name + '.' : '') + key);
        });

        return target;
    };

    /**
     * Validates the step
     *
     * @param {*} step
     * @param {Object} [field]
     * @param {Object} [fields]
     * @param {Object} [opt]
     * @param {string} [name]
     * @returns {*}
     */
    exp.validateStep = function (step, field, fields, opt, name) {

        // Setting
        step = XP.isDefined(step) ? step : null;

        // Checking
        if (!XP.isObject(field)) { return step; }

        // Validating
        exp.validateValue(step, field, null, name);

        // Validating (multi)
        if (field.multi && XP.isArray(step)) {
            step.forEach(function (value, i) {
                exp.validateValue(value, field, i, name + '[' + i + ']');
                if (XP.isObject(value) && (field.fields || field.type === 'recursive')) {
                    exp(value, field.fields || fields, XP.assign({}, opt, {strict: field.strict}), name + '[' + i + ']');
                }
            });
        }

        // Validating (map)
        if (field.map && XP.isObject(step) && (field.fields || field.type === 'recursive')) {
            exp(step, field.fields || fields, XP.assign({}, opt, {strict: field.strict}), name);
        }

        return step;
    };

    /**
     * Validates the value
     *
     * @param {*} value
     * @param {Object} [field]
     * @param {number | string} [i]
     * @param {string} [name]
     * @returns {*}
     */
    exp.validateValue = function (value, field, i, name) {

        // Vars
        var err;

        // Setting
        value = XP.isDefined(value) ? value : null;

        // Checking
        if (!XP.isObject(field)) { return value; }

        // Validating (type)
        if (XP.isVoid(i)) {
            if (XP.isError(err = (field.map ? exp.validators.map : exp.validators.multi).method(value, field.multi, name))) { throw err; }
        } else if (!field.multi) {
            if (XP.isError(err = exp.validators.type.method(value, field.type, name))) { throw err; }
        }

        // Validating
        XP.forOwn(field, function (val, key) {
            if (XP.has(exp.validators, key) && !XP.includes(['map', 'multi', 'type'], key)) {
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
        custom: {},
        stock: {}
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
        pattern: {input: 'text', options: XP.keys(exp.patterns.stock), type: 'string', method: function (target, pattern, name) {
            var reg = !XP.isString(target) || !XP.isString(pattern, true) ? null : (XP.has(exp.patterns.stock, pattern) ? exp.patterns.stock[pattern] : (XP.has(exp.patterns.custom, pattern) ? exp.patterns.custom[pattern] : pattern));
            if (XP.isString(reg) && XP.isRegExp(reg = XP.toRegExp(pattern))) { exp.patterns.custom[pattern] = reg; }
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
        type: {options: XP.keys(exp.types), required: true, method: function (target, type, name) {
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

}());