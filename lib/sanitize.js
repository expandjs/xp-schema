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
     * Sanitize the target
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

        // Restricting
        XP.forOwn(target, function (val, key) {
            if (options.strict && !fields[key]) { delete target[key]; }
        });

        // Sanitizing
        XP.forOwn(fields, function (field, key) {
            target[key] = exp.sanitizeStep(target[key], field, fields, options, (name ? name + '.' : '') + key);
            if (options.useful && XP.isVoid(target[key])) { delete target[key]; }
        });

        return target;
    };

    /**
     * Sanitizes the step
     *
     * @param {*} step
     * @param {Object} [field]
     * @param {Object} [fields]
     * @param {Object} [options]
     * @param {string} [name]
     * @returns {*}
     */
    exp.sanitizeStep = function (step, field, fields, options, name) {

        // Setting
        step = XP.isDefined(step) ? step : null;

        // Checking
        if (!XP.isObject(field)) { return step; }

        // Sanitizing (step)
        step = exp.sanitizeValue(step, field, null, name);

        // Sanitizing (values)
        if (field.map || field.multi) {
            XP[field.map ? 'forOwn' : 'forEach'](step, function (value, index) {
                step[index] = exp.sanitizeValue(value, field, index, name + '[' + index + ']');
                if (XP.isObject(step[index]) && (field.fields || field.type === 'recursive')) {
                    step[index] = exp(step[index], field.fields || fields, XP.assign({}, options, {strict: field.strict}), name + '[' + index + ']');
                }
            });
        } else if (XP.isObject(step) && (field.fields || field.type === 'recursive')) {
            step = exp(step, field.fields || fields, XP.assign({}, options, {strict: field.strict}), name);
        }

        return step;
    };

    /**
     * Sanitizes the value
     *
     * @param {*} value
     * @param {Object} [field]
     * @param {number | string} [index]
     * @param {string} [name]
     * @returns {*}
     */
    exp.sanitizeValue = function (value, field, index, name) {

        // Setting
        value = XP.isDefined(value) ? value : null;

        // Checking
        if (!XP.isObject(field)) { return value; }

        // Sanitizing (type)
        if (field.map && XP.isVoid(index)) {
            value = exp.sanitizers.map.method(value, field.map, name);
        } else if (field.multi && XP.isVoid(index)) {
            value = exp.sanitizers.multi.method(value, field.multi, name);
        } else {
            value = exp.sanitizers.type.method(value, field.type, name);
        }

        // Sanitizing (other)
        XP.forOwn(field, function (val, key) {
            if (exp.sanitizers[key] && !XP.includes(['map', 'multi', 'type'], key)) {
                value = exp.sanitizers[key].method(value, field[key], name);
            }
        });

        return value;
    };

    /*********************************************************************/

    /**
     * TODO DOC
     *
     * @property sanitizers
     * @type Object
     */
    exp.sanitizers = {

        /**
         * Returns map representation of target (based on bool)
         *
         * @param {*} target
         * @param {boolean} bool
         * @returns {*}
         */
        map: {method: function (target, bool) {
            return (bool && XP.toObject(target, true)) || target;
        }},

        /**
         * Returns array representation of target (based on bool)
         *
         * @param {*} target
         * @param {boolean} bool
         * @returns {*}
         */
        multi: {method: function (target, bool) {
            return (bool && XP.toArray(target, true)) || target;
        }},

        /**
         * Returns typed representation of target
         *
         * @param {*} target
         * @param {string} type
         * @returns {*}
         */
        type: {method: function (target, type) {
            return type === 'boolean' ? !!target : target;
        }}
    };

}(typeof window !== "undefined" ? window : global));