(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.XPSchema = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){

},{}],2:[function(_dereq_,module,exports){
/*jslint browser: true, devel: true, node: true, ass: true, nomen: true, unparam: true, indent: 4 */

module.exports = _dereq_('./lib');
},{"./lib":3}],3:[function(_dereq_,module,exports){
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

        sanitize   = _dereq_('./sanitize'),
        validate   = _dereq_('./validate'),

        filterer   = function (item) { return XP.has(item, 'input') || XP.has(item, 'options'); },
        mapper     = function (item, handle) { item = XP.assign({handle: handle}, item); XP.withdraw(item, 'method'); return item; },

        types      = XP.freeze(XP.keys(validate.types)),
        sanitizers = XP.freeze(XP.filter(XP.map(sanitize.sanitizers, mapper), filterer)),
        validators = XP.freeze(XP.filter(XP.map(validate.validators, mapper), filterer));

    /*********************************************************************/

    /**
     * This class is used to provide scheming functionalities.
     *
     * @class XPSchema
     * @description This class is used to provide scheming functionalities
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
                    function (next) { next(null, sanitize(data, self.fields, self.options)); }, // sanitizing
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
},{"./sanitize":4,"./validate":5,"expandjs":1,"xp-emitter":1}],4:[function(_dereq_,module,exports){
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
     * @param {Object} [options]
     * @returns {Object}
     */
    exp = module.exports = function (data, fields, options) {

        // Restricting
        XP.forOwn(data, function (val, key) {
            if (options.strict && !fields[key]) { delete data[key]; }
        });

        // Sanitizing
        XP.forOwn(fields, function (field, key) {
            data[key] = sanitizeStep(data[key], fields, options, key);
            if (options.useful && XP.isVoid(data[key])) { delete data[key]; }
        });

        return data;
    };

    /**
     * Sanitizes the step
     *
     * @param {*} step
     * @param {Object} [fields]
     * @param {Object} [options]
     * @param {string} [key]
     * @returns {*}
     */
    function sanitizeStep(step, fields, options, key) {

        // Setting
        step = XP.isDefined(step) ? step : null;

        // Checking
        if (!XP.isObject(fields[key]) && !XP.isString(fields[key], true)) { return step; }

        // Sanitizing (step)
        step = sanitizeValue(step, fields, options, key);

        // Sanitizing (values)
        if (fields[key].map || fields[key].multi) {
            XP[fields[key].map ? 'forOwn' : 'forEach'](step, function (value, index) {
                step[index] = sanitizeValue(step[index], fields, key, index);
                if (XP.isObject(step[index]) && (fields[key].fields || fields[key].type === 'recursive')) {
                    step[index] = exp(step[index], fields[key].fields || fields, options);
                }
            });
        } else if (XP.isObject(step) && (fields[key].fields || fields[key].type === 'recursive')) {
            step = exp(step, fields[key].fields || fields, options);
        }

        return step;
    }

    /**
     * Sanitizes the value
     *
     * @param {*} value
     * @param {Object} [fields]
     * @param {Object} [options]
     * @param {string} [key]
     * @param {number | string} [index]
     * @returns {*}
     */
    function sanitizeValue(value, fields, options, key, index) {

        // Setting
        value = XP.isDefined(value) ? value : null;

        // Vars
        var field     = (XP.isString(fields[key]) && {type: fields[key]}) || fields[key],
            sanitizer = (XP.isVoid(index) && ((field.map && 'map') || (field.multi && 'multi'))) || 'type',
            result    = exp.sanitizers[sanitizer].method(value, field[sanitizer]);

        // Sanitizing
        XP.forOwn(field, function (match, sanitizer) {
            if (exp.sanitizers[sanitizer] && sanitizer !== 'map' && sanitizer !== 'multi' && sanitizer !== 'type') {
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
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"expandjs":1}],5:[function(_dereq_,module,exports){
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
        if (fields[key].map || fields[key].multi) {
            XP[fields[key].map ? 'forOwn' : 'forEach'](step, function (value, index) {
                validateValue(value, fields, name + '[' + index + ']', key, index);
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
        var field     = (XP.isString(fields[key]) && {type: fields[key]}) || fields[key],
            validator = (XP.isVoid(index) && ((field.map && 'map') || (field.multi && 'multi'))) || 'type',
            error     = exp.validators[validator].method(value, field[validator], name);

        // Throwing
        if (error) { throw error; }

        // Validating
        XP.forOwn(field, function (match, validator) {
            if (exp.validators[validator] && validator !== 'map' && validator !== 'multi' && validator !== 'type' && (validator !== 'immutable' || item)) {
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
        input: XP.isInput,
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
         * @returns {boolean | Error | null}
         */
        exclusiveMaximum: {input: 'number', type: 'number', method: function (value, max, name) {
            return !XP.isFinite(value) || !XP.isFinite(max) ? false : (value >= max ? new XP.ValidationError(name || 'data', 'less than ' + max, 400) : null);
        }},

        /**
         * Returns error if value is lte than min.
         *
         * @param {number} value
         * @param {number} min
         * @param {string} [name]
         * @returns {boolean | Error | null}
         */
        exclusiveMinimum: {input: 'number', type: 'number', method: function (value, min, name) {
            return !XP.isFinite(value) || !XP.isFinite(min) ? false : (value <= min ? new XP.ValidationError(name || 'data', 'greater than ' + min, 400) : null);
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
            return bool && !XP.isEquivalent(value, current) ? new XP.ImmutableError(name || 'data', 409) : null;
        }},

        /**
         * Returns error if value is not an map (based on bool).
         *
         * @param {*} value
         * @param {boolean} bool
         * @param {string} [name]
         * @returns {boolean | Error | null}
         */
        map: {input: 'checkbox', multi: true, method: function (value, bool, name) {
            return XP.xor(bool, XP.isObject(value)) ? new XP.ValidationError(name || 'data', 'a map', 400) : null;
        }},

        /**
         * Returns error if value is gt than max.
         *
         * @param {number} value
         * @param {number} max
         * @param {string} [name]
         * @returns {boolean | Error | null}
         */
        maximum: {input: 'number', type: 'number', method: function (value, max, name) {
            return !XP.isFinite(value) || !XP.isFinite(max) ? false : (value > max ? new XP.ValidationError(name || 'data', 'a maximum of ' + max, 400) : null);
        }},

        /**
         * Returns error if value length is gt than max.
         *
         * @param {Array} value
         * @param {number} max
         * @param {string} [name]
         * @returns {boolean | Error | null}
         */
        maxItems: {attributes: {min: 1}, input: 'number', multi: true, method: function (value, max, name) {
            return !XP.isArray(value) || !XP.isFinite(max) || max < 1 ? false : (value.length > max ? new XP.ValidationError(name || 'data', 'a maximum of ' + max + ' items', 400) : null);
        }},

        /**
         * Returns error if value length is gt than max.
         *
         * @param {string} value
         * @param {number} max
         * @param {string} [name]
         * @returns {boolean | Error | null}
         */
        maxLength: {attributes: {min: 1}, input: 'number', type: 'string', method: function (value, max, name) {
            return !XP.isString(value) || !XP.isFinite(max) || max < 1 ? false : (value.length > max ? new XP.ValidationError(name || 'data', 'a maximum of ' + max + ' chars', 400) : null);
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
            return !XP.isFinite(value) || !XP.isFinite(min) ? false : (value < min ? new XP.ValidationError(name || 'data', 'a minimum of ' + min, 400) : null);
        }},

        /**
         * Returns error if value length is lt than min.
         *
         * @param {Array} value
         * @param {number} min
         * @param {string} [name]
         * @returns {boolean | Error | null}
         */
        minItems: {attributes: {min: 1}, input: 'number', multi: true, method: function (value, min, name) {
            return !XP.isArray(value) || !XP.isFinite(min) ? false : (value.length < min ? new XP.ValidationError(name || 'data', 'a minimum of ' + min + ' items', 400) : null);
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
            return !XP.isString(value) || !XP.isFinite(min) ? false : (value.length < min ? new XP.ValidationError(name || 'data', 'a minimum of ' + min + ' chars', 400) : null);
        }},

        /**
         * Returns error if value is not array (based on bool).
         *
         * @param {*} value
         * @param {boolean} bool
         * @param {string} [name]
         * @returns {boolean | Error | null}
         */
        multi: {input: 'checkbox', method: function (value, bool, name) {
            return XP.xor(bool, XP.isArray(value)) ? new XP.ValidationError(name || 'data', 'multi', 400) : null;
        }},

        /**
         * Returns error if value is not multiple of val.
         *
         * @param {number} value
         * @param {number} val
         * @param {string} [name]
         * @returns {boolean | Error | null}
         */
        multipleOf: {input: 'number', type: 'number', method: function (value, val, name) {
            return !XP.isFinite(value) || !XP.isFinite(val) ? false : (value % val !== 0 ? new XP.ValidationError(name || 'data', 'divisible by ' + val, 400) : null);
        }},

        /**
         * Returns error if value matches pattern.
         *
         * @param {string} value
         * @param {string} pattern
         * @param {string} [name]
         * @returns {boolean | Error | null}
         */
        pattern: {input: 'text', options: XP.keys(exp.patterns), type: 'string', method: function (value, pattern, name) {
            var reg = XP.isString(value) && XP.isString(pattern, true) && (exp.patterns[pattern] || pattern);
            if (XP.isString(reg) && XP.isRegExp(reg = XP.toRegExp(pattern))) { exp.patterns[pattern] = reg; }
            return !reg ? false : (!reg.test(value) ? new XP.InvalidError(name || 'data', 400) : null);
        }},

        /**
         * Returns error if value is empty (based on bool).
         *
         * @param {*} value
         * @param {boolean} bool
         * @param {string} [name]
         * @returns {boolean | Error | null}
         */
        required: {input: 'checkbox', method: function (value, bool, name) {
            return bool && XP.isEmpty(value) ? new XP.RequiredError(name || 'data', 400) : null;
        }},

        /**
         * Returns error if value type is not correct.
         *
         * @param {*} value
         * @param {string} type
         * @param {string} [name]
         * @returns {boolean | Error|null}
         */
        type: {attributes: {required: true}, options: XP.keys(exp.types), method: function (value, type, name) {
            return exp.types[type] && !exp.types[type](value) && !XP.isVoid(value) ? new XP.ValidationError(name || 'data', type || 'any', 400) : null;
        }},

        /**
         * Returns error if value includes duplicates (based on bool).
         *
         * @param {Array} value
         * @param {boolean} bool
         * @param {string} [name]
         * @returns {boolean | Error | null}
         */
        uniqueItems: {input: 'checkbox', multi: true, method: function (value, bool, name) {
            return !XP.isArray(value) ? false : (bool && !XP.isUniq(value) ? new XP.ValidationError(name || 'data', 'should not have duplicates', 400) : null);
        }}
    };

}(typeof window !== "undefined" ? window : global));
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"expandjs":1}]},{},[2])(2)
});