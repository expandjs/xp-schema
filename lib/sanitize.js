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
     * Sanitize the data
     *
     * @param {Object} data
     * @param {Object} fields
     * @returns {Object}
     */
    exp = module.exports = function (data, fields) {

        // Sanitizing
        XP.forOwn(fields, function (field, key) {
            data[key] = sanitizeStep(data[key], fields, key);
        });

        return data;
    };

    /**
     * Sanitizes the step
     *
     * @param {*} step
     * @param {Object} [fields]
     * @param {string} [key]
     * @returns {*}
     */
    function sanitizeStep(step, fields, key) {

        // Setting
        step = XP.isDefined(step) ? step : null;

        // Checking
        if (!XP.isObject(fields[key]) && !XP.isString(fields[key], true)) { return step; }

        // Sanitizing (step)
        step = sanitizeValue(step, fields, key);

        // Sanitizing (values)
        if (fields[key].multi === 'list' || fields[key].multi === 'map') {
            XP[fields[key].multi === 'list' ? 'forEach' : 'forOwn'](step, function (value, index) {
                step[index] = sanitizeValue(step[index], fields, key, index);
                if (XP.isObject(step[index]) && (fields[key].fields || fields[key].type === 'recursive')) {
                    step[index] = exp(step[index], fields[key].fields || fields);
                }
            });
        } else if (XP.isObject(step) && (fields[key].fields || fields[key].type === 'recursive')) {
            step = exp(step, fields[key].fields || fields);
        }

        return step;
    }

    /**
     * Sanitizes the value
     *
     * @param {*} value
     * @param {Object} [fields]
     * @param {string} [key]
     * @param {number | string} [index]
     * @returns {*}
     */
    function sanitizeValue(value, fields, key, index) {

        // Setting
        value = XP.isDefined(value) ? value : null;

        // Vars
        var field     = XP.isString(fields[key]) ? {type: fields[key]} : fields[key],
            sanitizer = XP.isVoid(index) && (field.multi === 'list' || field.multi === 'map') ? 'multi' : 'type',
            result    = exp.sanitizers[sanitizer].method(value, field[sanitizer]);

        // Sanitizing
        XP.forOwn(field, function (match, sanitizer) {
            if (exp.sanitizers[sanitizer] && sanitizer !== 'multi' && sanitizer !== 'type') {
                result = exp.sanitizers[sanitizer].method(result, match);
            }
        });

        return result;
    }

    /*********************************************************************/

    /**
     * The available sanitizers.
     *
     * @property sanitizers
     * @type Object
     */
    exp.sanitizers = {

        /**
         * Returns multi representation of value (based on bool)
         *
         * @param {*} value
         * @param {string} multi
         * @returns {*}
         */
        multi: {method: function (value, type) {
            if (type === 'list' && XP.isVoid(value)) { return []; }
            if (type === 'map' && XP.isVoid(value)) { return {}; }
            return value;
        }},

        /**
         * Returns typed representation of value
         *
         * @param {*} value
         * @param {string} type
         * @returns {*}
         */
        type: {method: function (value, type) {
            if (type === 'boolean' && XP.isVoid(value)) { return false; }
            return value;
        }}
    };

}(typeof window !== "undefined" ? window : global));
