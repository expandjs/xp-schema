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
     * Restricts the data
     *
     * @param {Object} data
     * @param {Object} fields
     * @param {Object} [options]
     * @returns {Object}
     */
    exp = module.exports = function (data, fields, options) {

        // Restricting
        XP.forOwn(data, function (val, key) {
            if (options.strict && !fields[key]) { delete data[key]; return; }
            if (options.useful && XP.isVoid(data[key])) { delete data[key]; return; }
            data[key] = restrictStep(data[key], fields, options, key);
        });

        return data;
    };

    /**
     * Restricts the step
     *
     * @param {*} step
     * @param {Object} [fields]
     * @param {Object} [options]
     * @param {string} [key]
     * @returns {*}
     */
    function restrictStep(step, fields, options, key) {

        // Restricting (values)
        if (fields[key].multi === 'list' || fields[key].multi === 'map') {
            XP[fields[key].multi === 'list' ? 'forEach' : 'forOwn'](step, function (value, index) {
                if (XP.isObject(step[index]) && (fields[key].fields || fields[key].type === 'recursive')) {
                    step[index] = exp(step[index], fields[key].fields || fields, options);
                }
            });
        } else if (XP.isObject(step) && (fields[key].fields || fields[key].type === 'recursive')) {
            step = exp(step, fields[key].fields || fields, options);
        }

        return step;
    }

}(typeof window !== "undefined" ? window : global));
