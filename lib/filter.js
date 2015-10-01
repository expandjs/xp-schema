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
    var XP = global.XP || require('expandjs');

    /*********************************************************************/

    /**
     * Filters the data
     *
     * @param {Object} data
     * @param {Object} fields
     * @returns {Object}
     */
    module.exports = function (data, fields) {

        // Filtering
        XP.forOwn(data, function (val, key) {
            if (!fields[key] || !fields[key].immutable) { return; }
            delete data[key];
        });

        return data;
    };

}(typeof window !== "undefined" ? window : global));