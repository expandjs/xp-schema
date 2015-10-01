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
     * @param {Object} [options]
     * @param {string} [name]
     * @returns {Object}
     */
    exp = module.exports = function (data, fields, options, name) {

        // Restricting
        XP.forOwn(data, function (val, key) {
            if (!options.loose && !fields[key]) { delete data[key]; }
        });

        // Sanitizing
        XP.forOwn(fields, function (field, key) {
            data[key] = exp.sanitizeStep(data[key], field, fields, options, (name ? name + '.' : '') + key);
            if (options.useful && XP.isVoid(data[key])) { delete data[key]; }
        });

        return data;
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
                    step[index] = exp(step[index], field.fields || fields, XP.assign({}, options, {loose: field.loose}), name + '[' + index + ']');
                }
            });
        } else if (XP.isObject(step) && (field.fields || field.type === 'recursive')) {
            step = exp(step, field.fields || fields, XP.assign({}, options, {loose: field.loose}), name);
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

        // Vars
        var key = (XP.isVoid(index) && ((field.map && 'map') || (field.multi && 'multi'))) || 'type',
            val = exp.sanitizers[key].method(value, field[key], name);

        // Sanitizing
        XP.forOwn(field, function (sub, key) {
            if (!exp.sanitizers[key] || key === 'map' || key === 'multi' || key === 'type') { return; }
            val = exp.sanitizers[key].method(val, sub, name);
        });

        return val;
    };

    /*********************************************************************/

    /**
     * The available sanitizers.
     *
     * @property sanitizers
     * @type Object
     */
    exp.sanitizers = {

        /**
         * Returns map representation of value (based on bool)
         *
         * @param {*} value
         * @param {boolean} bool
         * @returns {*}
         */
        map: {method: function (value, bool) {
            return XP.isVoid(value) && bool ? {} : value;
        }},

        /**
         * Returns array representation of value (based on bool)
         *
         * @param {*} value
         * @param {boolean} bool
         * @returns {*}
         */
        multi: {method: function (value, bool) {
            return XP.isVoid(value) && bool ? [] : value;
        }},

        /**
         * Returns typed representation of value
         *
         * @param {*} value
         * @param {string} type
         * @returns {*}
         */
        type: {method: function (value, type) {
            return XP.isVoid(value) && type === 'boolean' ? false : value;
        }}
    };

}(typeof window !== "undefined" ? window : global));