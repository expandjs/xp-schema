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
     * @param {Object} [opt]
     * @param {string} [name]
     * @returns {Object}
     */
    exp = module.exports = function (target, fields, opt, name) {

        // Checking
        if (!XP.isObject(fields)) { return target; }

        // Restricting
        XP.forOwn(target, function (val, key) {
            if (opt.strict && !XP.has(fields, key)) { delete target[key]; }
        });

        // Sanitizing
        XP.forOwn(fields, function (val, key) {
            target[key] = exp.sanitizeStep(target[key], fields[key], fields, opt, (name ? name + '.' : '') + key);
            if (opt.useful && target[key] === null) { delete target[key]; }
        });

        return target;
    };

    /**
     * Sanitizes the step
     *
     * @param {*} step
     * @param {Object} [field]
     * @param {Object} [fields]
     * @param {Object} [opt]
     * @param {string} [name]
     * @returns {*}
     */
    exp.sanitizeStep = function (step, field, fields, opt, name) {

        // Setting
        step = XP.isDefined(step) ? step : null;

        // Checking
        if (!XP.isObject(field)) { return step; }

        // Sanitizing
        step = exp.sanitizeValue(step, field, null, name);

        // Sanitizing (multi)
        if (field.multi && XP.isArray(step)) {
            step.forEach(function (value, i) {
                step[i] = exp.sanitizeValue(value, field, i, name + '[' + i + ']');
                if (XP.isObject(step[i]) && (field.fields || field.type === 'recursive')) {
                    step[i] = exp(step[i], field.fields || fields, XP.assign({}, opt, {strict: field.strict}), name + '[' + i + ']');
                }
            });
        }

        // Sanitizing (map)
        if (field.map && XP.isObject(step) && (field.fields || field.type === 'recursive')) {
            step = exp(step, field.fields || fields, XP.assign({}, opt, {strict: field.strict}), name);
        }

        return step;
    };

    /**
     * Sanitizes the value
     *
     * @param {*} value
     * @param {Object} [field]
     * @param {number | string} [i]
     * @param {string} [name]
     * @returns {*}
     */
    exp.sanitizeValue = function (value, field, i, name) {

        // Setting
        value = XP.isDefined(value) ? value : null;

        // Checking
        if (!XP.isObject(field)) { return value; }

        // Sanitizing (type)
        if (XP.isVoid(i)) {
            value = (field.map ? exp.sanitizers.map : exp.sanitizers.multi).method(value, field.multi, name);
        } else if (!field.multi) {
            value = exp.sanitizers.type.method(value, field.type, name);
        }

        // Sanitizing
        XP.forOwn(field, function (val, key) {
            if (XP.has(exp.sanitizers, key) && !XP.includes(['map', 'multi', 'type'], key)) {
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
     * @private
     */
    exp.sanitizers = {

        /**
         * Returns map representation of target (based on bool)
         *
         * @param {*} target
         * @param {boolean} bool
         * @returns {*}
         * @private
         */
        map: {method: function (target, bool) {
            return !bool ? target : XP.toObject(target, true);
        }},

        /**
         * Returns array representation of target (based on bool)
         *
         * @param {*} target
         * @param {boolean} bool
         * @returns {*}
         * @private
         */
        multi: {method: function (target, bool) {
            return !bool ? target : XP.toArray(target, true);
        }},

        /**
         * Returns typed representation of target
         *
         * @param {*} target
         * @param {string} type
         * @returns {*}
         * @private
         */
        type: {method: function (target, type) {
            return type !== 'boolean' ? target : !!target;
        }}
    };

}(typeof window !== "undefined" ? window : global));