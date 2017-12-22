/**
 * @license
 * Copyright (c) 2017 The expand.js authors. All rights reserved.
 * This code may only be used under the BSD style license found at https://expandjs.github.io/LICENSE.txt
 * The complete set of authors may be found at https://expandjs.github.io/AUTHORS.txt
 * The complete set of contributors may be found at https://expandjs.github.io/CONTRIBUTORS.txt
 */

// Const
const env = typeof window !== "undefined" ? window : global,
    XP    = env.XP || require('expandjs');

/*********************************************************************/

// Exporting
module.exports = function (schema, item, options) {

    // Mapping
    Object.keys(item).forEach(name => {

        // Let
        let key   = options.reading && name || Object.keys(schema.fields || {}).find(key => schema.fields[key].alias === name) || name,
            alias = schema.fields[key] && schema.fields[key].alias || key,
            field = schema.fields[key],
            step  = item[name];

        // Setting
        if (field && alias !== key) { item[options.reading ? alias : key] = step; }

        // Deleting
        if (field && alias !== key) { delete item[options.reading ? key : alias]; }

        // Preventing
        if (!field || !field.fields && !field.recursive) { return; }

        // Mapping (sub fields)
        if (!field.list) { return XP.isObject(step) && module.exports(field.recursive ? schema : field, step, options); }

        // Mapping (sub values)
        Array.from(XP.isArray(step) ? step : []).forEach(value => XP.isObject(value) && module.exports(field.recursive ? schema : field, value, options));
    });

    // Returning
    return item;
};
