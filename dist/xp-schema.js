(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.XPSchema = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
/*jslint browser: true, devel: true, node: true, ass: true, nomen: true, unparam: true, indent: 4 */

module.exports = _dereq_('./lib');
},{"./lib":2}],2:[function(_dereq_,module,exports){
(function (global){
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
    var XP         = global.XP || _dereq_('expandjs'),
        XPEmitter  = global.XPEmitter || _dereq_('xp-emitter'),

        restrict   = _dereq_('./restrict'),
        sanitize   = _dereq_('./sanitize'),
        validate   = _dereq_('./validate'),

        filterer   = function (item) { return item.hasOwnProperty('input') || item.hasOwnProperty('options'); },
        mapper     = function (item, handle) { item = XP.assign({handle: handle}, item); XP.withdraw(item, 'method'); return item; },

        types      = XP.freeze(XP.keys(validate.types)),
        sanitizers = XP.freeze(XP.filter(XP.map(sanitize.sanitizers, mapper), filterer)),
        validators = XP.freeze(XP.filter(XP.map(validate.validators, mapper), filterer));

    /*********************************************************************/

    /**
     * A class used to provide scheming functionalities.
     *
     * @class XPSchema
     * @description A class used to provide scheming functionalities
     * @extends XPEmitter
     */
    module.exports = global.XPSchema = new XP.Class('XPSchema', {

        // EXTENDS
        extends: XPEmitter,

        /*********************************************************************/

        /**
         * @constructs
         * @param {Object} options
         *   @param {Object} [options.fields]
         *   @param {boolean} [options.strict = false]
         *   @param {boolean} [options.useful = false]
         */
        initialize: function (options) {

            // Vars
            var self = this;

            // Super
            XPEmitter.call(self);

            // Setting
            self.options = options;
            self.fields  = self.options.fields || {};
            self.strict  = self.options.strict || false;
            self.useful  = self.options.useful || false;
        },

        /*********************************************************************/

        /**
         * TODO DOC
         *
         * @method filter
         * @param {Object} data
         * @param {Function} [resolver]
         * @returns {Promise}
         */
        filter: {
            promise: true,
            value: function (data, resolver) {
                var self = this;
                XP.waterfall([
                    function (next) { self._assert({data: data}, next); }, // asserting
                    function (next) { next(null, XP.forOwn(self.fields, function (field, key) { if (field.reserved) { delete data[key]; } })); }, // filtering
                    function (next) { next(null, data); } // resolving
                ], resolver);
            }
        },

        /**
         * TODO DOC
         *
         * @method merge
         * @param {Object} data
         * @param {Object} [item]
         * @param {boolean} [reservedOnly = false]
         * @param {Function} [resolver]
         * @returns {Promise}
         */
        merge: {
            promise: true,
            value: function (data, item, reservedOnly, resolver) {
                var self = this;
                XP.waterfall([
                    function (next) { self._assert({data: data, item: item}, next); }, // asserting
                    function (next) { next(null, XP.forOwn(item || {}, function (value, key) { if (!XP.isDefined(data[key]) && (!reservedOnly || (self.fields[key] && self.fields[key].reserved))) { data[key] = item[key]; } })); }, // merging
                    function (next) { next(null, data); } // resolving
                ], resolver);
            }
        },

        /**
         * TODO DOC
         *
         * @method prepare
         * @param {Object} data
         * @param {Function} [resolver]
         * @returns {Promise}
         */
        prepare: {
            promise: true,
            value: function (data, resolver) {
                var self = this;
                XP.waterfall([
                    function (next) { self._assert({data: data}, next); }, // asserting
                    function (next) { next(null, XP.forOwn(self.fields, function (field, key) { if (XP.isDefined(field.value) && XP.isVoid(data[key])) { data[key] = XP.isFunction(field.value) ? field.value() : field.value; } })); }, // preparing
                    function (next) { next(null, data); } // resolving
                ], resolver);
            }
        },

        /**
         * TODO DOC
         *
         * @method restrict
         * @param {Object} data
         * @param {Function} [resolver]
         * @returns {Promise}
         */
        restrict: {
            promise: true,
            value: function (data, resolver) {
                var self = this;
                XP.waterfall([
                    function (next) { self._assert({data: data}, next); }, // asserting
                    function (next) { next(null, restrict(data, self.fields, self.options)); }, // restricting
                    function (next) { next(null, data); } // resolving
                ], resolver);
            }
        },

        /**
         * TODO DOC
         *
         * @method sanitize
         * @param {Object} data
         * @param {Function} [resolver]
         * @returns {Promise}
         */
        sanitize: {
            promise: true,
            value: function (data, resolver) {
                var self = this;
                XP.waterfall([
                    function (next) { self._assert({data: data}, next); }, // asserting
                    function (next) { next(null, sanitize(data, self.fields)); }, // sanitizing
                    function (next) { next(null, data); } // resolving
                ], resolver);
            }
        },

        /**
         * TODO DOC
         *
         * @method validate
         * @param {Object} data
         * @param {Object} [item]
         * @param {Function} [resolver]
         * @returns {Promise}
         */
        validate: {
            promise: true,
            value: function (data, item, resolver) {
                var self = this;
                XP.waterfall([
                    function (next) { self._assert({data: data, item: item}, next); }, // asserting
                    function (next) { next(validate(data, self.fields, item), null); }, // validating
                    function (next) { next(null, data); } // resolving
                ], resolver);
            }
        },

        /*********************************************************************/

        /**
         * TODO DOC
         *
         * @property fields
         * @type Object
         */
        fields: {
            validate: function (val) { return !XP.isObject(val) && 'Object'; }
        },

        /**
         * TODO DOC
         *
         * @property sanitizers
         * @type Object
         * @readonly
         * @static
         */
        sanitizers: {
            'static': true,
            get: function () { return sanitizers; }
        },

        /**
         * TODO DOC
         *
         * @property strict
         * @type boolean
         * @default false
         */
        strict: {
            set: function (val) { return !!val; }
        },

        /**
         * TODO DOC
         *
         * @property types
         * @type Array
         * @readonly
         * @static
         */
        types: {
            'static': true,
            get: function () { return types; }
        },

        /**
         * TODO DOC
         *
         * @property useful
         * @type boolean
         * @default false
         */
        useful: {
            set: function (val) { return !!val; }
        },

        /**
         * TODO DOC
         *
         * @property validators
         * @type Object
         * @readonly
         * @static
         */
        validators: {
            'static': true,
            get: function () { return validators; }
        },

        /*********************************************************************/

        // ASSERTS
        _assertData: {enumerable: false, value: function (val) { return !XP.isObject(val) && new XP.ValidationError('data', 'Object', 400); }},
        _assertItem: {enumerable: false, value: function (val) { return !XP.isVoid(val) && !XP.isObject(val) && new XP.ValidationError('item', 'Object', 500); }}
    });

}(typeof window !== "undefined" ? window : global));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./restrict":3,"./sanitize":4,"./validate":5,"expandjs":6,"xp-emitter":6}],3:[function(_dereq_,module,exports){
(function (global){
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
        XP  = global.XP || _dereq_('expandjs');

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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"expandjs":6}],4:[function(_dereq_,module,exports){
(function (global){
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
        XP  = global.XP || _dereq_('expandjs');

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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"expandjs":6}],5:[function(_dereq_,module,exports){
(function (global){
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
        XP  = global.XP || _dereq_('expandjs');

    /*********************************************************************/

    /**
     * Validates the data.
     *
     * @param {Object} data
     * @param {Object} fields
     * @param {Object} [item]
     * @param {string} [name]
     * @returns {Object}
     */
    exp = module.exports = function (data, fields, item, name) {

        // Trying
        try {

            // Validating
            XP.forOwn(fields, function (field, key) {
                validateStep(data[key], fields, item, (name ? name + '.' : '') + key, key);
            });

            return null;
        }

        // Catching
        catch (error) { return error; }
    };

    /**
     * Validates the step.
     *
     * @param {*} step
     * @param {Object} [fields]
     * @param {Object} [item]
     * @param {string} [name]
     * @param {string} [key]
     * @throws Error
     */
    function validateStep(step, fields, item, name, key) {

        // Setting
        step = XP.isDefined(step) ? step : null;

        // Checking
        if (!XP.isObject(fields[key]) && !XP.isString(fields[key], true)) { return; }

        // Validating (step)
        validateValue(step, fields, item, name, key);

        // Validating (values)
        if (fields[key].multi === 'list' || fields[key].multi === 'map') {
            XP[fields[key].multi === 'list' ? 'forEach' : 'forOwn'](step, function (value, index) {
                validateValue(value, fields, item, name + '[' + index + ']', key, index);
                if (XP.isObject(value) && (fields[key].fields || fields[key].type === 'recursive')) {
                    exp(value, fields[key].fields || fields, item, name + '[' + index + ']');
                }
            });
        } else if (XP.isObject(step) && (fields[key].fields || fields[key].type === 'recursive')) {
            exp(step, fields[key].fields || fields, item, name);
        }
    }

    /**
     * Validates the value.
     *
     * @param {*} value
     * @param {Object} [fields]
     * @param {Object} [item]
     * @param {string} [name]
     * @param {string} [key]
     * @param {number | string} [index]
     * @throws Error
     */
    function validateValue(value, fields, item, name, key, index) {

        // Setting
        value = XP.isDefined(value) ? value : null;

        // Vars
        var field     = XP.isString(fields[key]) ? {type: fields[key]} : fields[key],
            validator = XP.isVoid(index) && (field.multi === 'list' || field.multi === 'map') ? 'multi' : 'type',
            error     = exp.validators[validator].method(value, field[validator], name);

        // Throwing
        if (error) { throw error; }

        // Validating
        XP.forOwn(field, function (match, validator) {
            if (exp.validators[validator] && validator !== 'multi' && validator !== 'type' && (validator !== 'immutable' || item)) {
                if (error = exp.validators[validator].method(value, match, name, item && item[key])) { throw error; }
            }
        });
    }

    /*********************************************************************/

    /**
     * The available patterns.
     *
     * @property patterns
     * @type Object
     */
    exp.patterns = {
        camelCase: XP.camelCaseRegex,
        capitalize: XP.capitalizeRegex,
        kebabCase: XP.kebabCaseRegex,
        keyCase: XP.keyCaseRegex,
        lowerCase: XP.lowerCaseRegex,
        snakeCase: XP.snakeCaseRegex,
        startCase: XP.startCaseRegex,
        trim: XP.trimRegex,
        upperCase: XP.upperCaseRegex,
        uuid: XP.uuidRegex
    };

    /**
     * The available types.
     *
     * @property types
     * @type Object
     */
    exp.types = {
        boolean: XP.isBoolean,
        number: XP.isFinite,
        object: XP.isObject,
        recursive: XP.isObject,
        string: XP.isString
    };

    /**
     * The available validators.
     *
     * @property validators
     * @type Object
     */
    exp.validators = {

        /**
         * Returns error if value is gte than max.
         *
         * @param {number} value
         * @param {number} max
         * @param {string} [name]
         * @returns {boolean | Error}
         */
        exclusiveMaximum: {input: 'number', type: 'number', method: function (value, max, name) {
            if (!XP.isFinite(value) || !XP.isFinite(max)) { return false; }
            if (value >= max) { return new XP.ValidationError(name || 'data', 'less than ' + max, 400); }
            return null;
        }},

        /**
         * Returns error if value is lte than min.
         *
         * @param {number} value
         * @param {number} min
         * @param {string} [name]
         * @returns {boolean | Error}
         */
        exclusiveMinimum: {input: 'number', type: 'number', method: function (value, min, name) {
            if (!XP.isFinite(value) || !XP.isFinite(min)) { return false; }
            if (value <= min) { return new XP.ValidationError(name || 'data', 'greater than ' + min, 400); }
            return null;
        }},

        /**
         * Returns error if value is not equivalent to current (based on bool).
         *
         * @param {*} value
         * @param {boolean} bool
         * @param {string} [name]
         * @param {*} [current]
         */
        immutable: {input: 'checkbox', method: function (value, bool, name, current) {
            if (bool && !XP.isEquivalent(value, current)) { return new XP.ImmutableError(name || 'data', 409); }
            return null;
        }},

        /**
         * Returns error if value is gt than max.
         *
         * @param {number} value
         * @param {number} max
         * @param {string} [name]
         * @returns {boolean | Error}
         */
        maximum: {input: 'number', type: 'number', method: function (value, max, name) {
            if (!XP.isFinite(value) || !XP.isFinite(max)) { return false; }
            if (value > max) { return new XP.ValidationError(name || 'data', 'a maximum of ' + max, 400); }
            return null;
        }},

        /**
         * Returns error if value length is gt than max.
         *
         * @param {Array} value
         * @param {number} max
         * @param {string} [name]
         * @returns {boolean | Error}
         */
        maxItems: {attributes: {min: 1}, input: 'number', multi: true, method: function (value, max, name) {
            if (!XP.isArray(value) || !XP.isFinite(max) || max < 1) { return false; }
            if (value.length > max) { return new XP.ValidationError(name || 'data', 'a maximum of ' + max + ' items', 400); }
            return null;
        }},

        /**
         * Returns error if value length is gt than max.
         *
         * @param {string} value
         * @param {number} max
         * @param {string} [name]
         * @returns {boolean | Error}
         */
        maxLength: {attributes: {min: 1}, input: 'number', type: 'string', method: function (value, max, name) {
            if (!XP.isString(value) || !XP.isFinite(max) || max < 1) { return false; }
            if (value.length > max) { return new XP.ValidationError(name || 'data', 'a maximum of ' + max + ' chars', 400); }
            return null;
        }},

        /**
         * Returns error if value is lt than min.
         *
         * @param {number} value
         * @param {number} min
         * @param {string} [name]
         * @returns {boolean | Error|null}
         */
        minimum: {input: 'number', type: 'number', method: function (value, min, name) {
            if (!XP.isFinite(value) || !XP.isFinite(min)) { return false; }
            if (value < min) { return new XP.ValidationError(name || 'data', 'a minimum of ' + min, 400); }
            return null;
        }},

        /**
         * Returns error if value length is lt than min.
         *
         * @param {Array} value
         * @param {number} min
         * @param {string} [name]
         * @returns {boolean | Error}
         */
        minItems: {attributes: {min: 1}, input: 'number', multi: true, method: function (value, min, name) {
            if (!XP.isArray(value) || !XP.isFinite(min)) { return false; }
            if (value.length < min) { return new XP.ValidationError(name || 'data', 'a minimum of ' + min + ' items', 400); }
            return null;
        }},

        /**
         * Returns error if value length is lt than min.
         *
         * @param {string} value
         * @param {number} min
         * @param {string} [name]
         * @returns {boolean | Error|null}
         */
        minLength: {attributes: {min: 1}, input: 'number', type: 'string', method: function (value, min, name) {
            if (!XP.isString(value) || !XP.isFinite(min)) { return false; }
            if (value.length < min) { return new XP.ValidationError(name || 'data', 'a minimum of ' + min + ' chars', 400); }
            return null;
        }},

        /**
         * Returns error if value is not array (based on bool).
         *
         * @param {*} value
         * @param {string} type
         * @param {string} [name]
         * @returns {boolean | Error}
         */
        multi: {options: ['none', 'list', 'map'], method: function (value, type, name) {
            if (type === 'list' && !XP.isArray(value)) { return new XP.ValidationError(name || 'data', 'a list', 400); }
            if (type === 'map' && !XP.isObject(value)) { return new XP.ValidationError(name || 'data', 'a map', 400); }
            return null;
        }},

        /**
         * Returns error if value is not multiple of val.
         *
         * @param {number} value
         * @param {number} val
         * @param {string} [name]
         * @returns {boolean | Error}
         */
        multipleOf: {input: 'number', type: 'number', method: function (value, val, name) {
            if (!XP.isFinite(value) || !XP.isFinite(val)) { return false; }
            if (value % val !== 0) { return new XP.ValidationError(name || 'data', 'divisible by ' + val, 400); }
            return null;
        }},

        /**
         * Returns error if value matches pattern.
         *
         * @param {string} value
         * @param {string} pattern
         * @param {string} [name]
         * @returns {boolean | Error}
         */
        pattern: {input: 'text', options: XP.keys(exp.patterns), type: 'string', method: function (value, pattern, name) {
            var reg = XP.isString(value) && XP.isString(pattern, true) && (exp.patterns[pattern] || pattern);
            if (XP.isString(reg) && XP.isRegExp(reg = XP.toRegExp(pattern))) { exp.patterns[pattern] = reg; }
            if (reg && !reg.test(value)) { return new XP.InvalidError(name || 'data', 400); }
            return null;
        }},

        /**
         * Returns error if value is empty (based on bool).
         *
         * @param {*} value
         * @param {boolean} bool
         * @param {string} [name]
         * @returns {boolean | Error}
         */
        required: {input: 'checkbox', method: function (value, bool, name) {
            if (bool && XP.isEmpty(value)) { return new XP.RequiredError(name || 'data', 400); }
            return null;
        }},

        /**
         * Returns error if value type is not correct.
         *
         * @param {*} value
         * @param {string} type
         * @param {string} [name]
         * @returns {boolean | Error}
         */
        type: {attributes: {required: true}, options: XP.keys(exp.types), method: function (value, type, name) {
            if (exp.types[type] && !exp.types[type](value) && !XP.isVoid(value)) { return new XP.ValidationError(name || 'data', type || 'any', 400); }
            return null;
        }},

        /**
         * Returns error if value includes duplicates (based on bool).
         *
         * @param {Array} value
         * @param {boolean} bool
         * @param {string} [name]
         * @returns {boolean | Error}
         */
        uniqueItems: {input: 'checkbox', multi: true, method: function (value, bool, name) {
            if (!XP.isArray(value)) { return false; }
            if (bool && !XP.isUniq(value)) { return new XP.ValidationError(name || 'data', 'should not have duplicates', 400); }
            return null;
        }}
    };

}(typeof window !== "undefined" ? window : global));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"expandjs":6}],6:[function(_dereq_,module,exports){

},{}]},{},[1])(1)
});