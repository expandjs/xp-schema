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
     * Filters the target
     *
     * @param {Object} target
     * @param {Object} fields
     * @returns {Object}
     */
    module.exports = function (target, fields) {

        // Filtering
        XP.forOwn(target, function (val, key) {
            if (XP.has(fields, key) && fields[key].immutable) { delete target[key]; }
        });

        return target;
    };

}(typeof window !== "undefined" ? window : global));