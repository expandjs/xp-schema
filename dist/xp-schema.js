(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.XPSchema = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
/*jslint browser: true, devel: true, node: true, ass: true, nomen: true, unparam: true, indent: 4 */

module.exports = require('./lib');
},{"./lib":4}],3:[function(require,module,exports){
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

        // Checking
        if (!XP.isObject(fields)) { return target; }

        // Filtering
        XP.forOwn(target, function (val, key) {
            if (XP.has(fields, key) && fields[key].immutable) { delete target[key]; }
        });

        return target;
    };

}(typeof window !== "undefined" ? window : global));
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"expandjs":1}],4:[function(require,module,exports){
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
    var filter     = require('./filter'),
        sanitize   = require('./sanitize'),
        validate   = require('./validate'),
        XP         = global.XP || require('expandjs'),

        filterFn   = function (item) { return XP.has(item, 'input') || XP.has(item, 'options'); },
        mapFn      = function (item, handle) { item = XP.assign({handle: handle}, item); XP.withdraw(item, 'method'); return item; },

        types      = XP.freeze(XP.keys(validate.types)),
        sanitizers = XP.freeze(XP.filter(XP.map(sanitize.sanitizers, mapFn), filterFn)),
        validators = XP.freeze(XP.filter(XP.map(validate.validators, mapFn), filterFn));

    /*********************************************************************/

    /**
     * This class is used to provide scheming functionalities, including sanitization and validation.
     *
     * @class XPSchema
     * @description This class is used to provide scheming functionalities, including sanitization and validation
     */
    module.exports = new XP.Class('XPSchema', {

        // OPTIONS
        options: {
            id: '',
            fields: null,
            strict: false,
            useful: false
        },

        /*********************************************************************/

        /**
         * @constructs
         * @param {Object} options
         *   @param {string} options.id
         *   @param {Object} [options.fields]
         *   @param {boolean} [options.strict = false]
         *   @param {boolean} [options.useful = false]
         */
        initialize: function (options) {

            // Vars
            var self = this;

            // Setting
            self.options = options;
            self.id      = self.options.id;
            self.fields  = self.options.fields || {};
            self.strict  = self.options.strict;
            self.useful  = self.options.useful;
        },

        /*********************************************************************/

        /**
         * Filters the target
         *
         * @method filter
         * @param {Object} target
         * @param {Function} [resolver]
         * @returns {Promise}
         */
        filter: {
            promise: true,
            value: function (target, resolver) {
                var self = this;
                XP.attempt(function (next) { next(null, filter(self.ensure(target, 'target'), self.fields, self.options)); }, resolver);
            }
        },

        /**
         * Sanitizes the target
         *
         * @method sanitize
         * @param {Object} target
         * @param {Function} [resolver]
         * @returns {Promise}
         */
        sanitize: {
            promise: true,
            value: function (target, resolver) {
                var self = this;
                XP.attempt(function (next) { next(null, sanitize(self.ensure(target, 'target'), self.fields, self.options)); }, resolver);
            }
        },

        /**
         * Validates the target
         *
         * @method validate
         * @param {Object} target
         * @param {Function} [resolver]
         * @returns {Promise}
         */
        validate: {
            promise: true,
            value: function (target, resolver) {
                var self = this;
                XP.attempt(function (next) { next(null, validate(self.ensure(target, 'target'), self.fields, self.options)); }, resolver);
            }
        },

        /*********************************************************************/

        /**
         * Used internally
         *
         * @method ensure
         * @param {*} target
         * @param {string} [name]
         * @returns {*}
         * @private
         */
        ensure: {
            enumerable: false,
            value: function (target, name) {
                var self = this;
                switch (name) {
                case 'target':
                    return XP.isObject(target = JSON.parse(XP.toJSON(target, self.options.useful))) ? target : {};
                default:
                    return target;
                }
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
            set: function (val) { return XP.assign(val, XP.zipObject(this.id, {type: 'string'})); },
            validate: function (val) { return XP.isObject(val); }
        },

        /**
         * TODO DOC
         *
         * @property id
         * @type string
         */
        id: {
            set: function (val) { return this.id || val; },
            validate: function (val) { return XP.isString(val, true); }
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
        }
    });

}(typeof window !== "undefined" ? window : global));
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./filter":3,"./sanitize":5,"./validate":6,"expandjs":1}],5:[function(require,module,exports){
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
            return (bool && XP.toObject(target, true)) || target;
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
            return (bool && XP.toArray(target, true)) || target;
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
            return type === 'boolean' ? !!target : target;
        }}
    };

}(typeof window !== "undefined" ? window : global));
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"expandjs":1}],6:[function(require,module,exports){
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
        XP  = global.XP || require('expandjs');

    /*********************************************************************/

    /**
     * Validates the target
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

        // Validating
        XP.forOwn(fields, function (field, key) {
            exp.validateStep(target[key], field, fields, options, (name ? name + '.' : '') + key);
        });

        return target;
    };

    /**
     * Validates the step
     *
     * @param {*} step
     * @param {Object} [field]
     * @param {Object} [fields]
     * @param {Object} [options]
     * @param {string} [name]
     * @returns {*}
     */
    exp.validateStep = function (step, field, fields, options, name) {

        // Setting
        step = XP.isDefined(step) ? step : null;

        // Checking
        if (!XP.isObject(field)) { return step; }

        // Validating (step)
        exp.validateValue(step, field, null, name);

        // Validating (values)
        if (field.map || field.multi) {
            XP[field.map ? 'forOwn' : 'forEach'](step, function (value, index) {
                exp.validateValue(value, field, index, name + '[' + index + ']');
                if (XP.isObject(value) && (field.fields || field.type === 'recursive')) {
                    exp(value, field.fields || fields, XP.assign({}, options, {strict: field.strict}), name + '[' + index + ']');
                }
            });
        } else if (XP.isObject(step) && (field.fields || field.type === 'recursive')) {
            exp(step, field.fields || fields, XP.assign({}, options, {strict: field.strict}), name);
        }

        return step;
    };

    /**
     * Validates the value
     *
     * @param {*} value
     * @param {Object} [field]
     * @param {number | string} [index]
     * @param {string} [name]
     * @returns {*}
     */
    exp.validateValue = function (value, field, index, name) {

        // Vars
        var err;

        // Setting
        value = XP.isDefined(value) ? value : null;

        // Checking
        if (!XP.isObject(field)) { return value; }

        // Validating (type)
        if (field.map && XP.isVoid(index)) {
            if (XP.isError(err = exp.validators.map.method(value, field.map, name))) { throw err; }
        } else if (field.multi && XP.isVoid(index)) {
            if (XP.isError(err = exp.validators.multi.method(value, field.multi, name))) { throw err; }
        } else {
            if (XP.isError(err = exp.validators.type.method(value, field.type, name))) { throw err; }
        }

        // Validating (other)
        XP.forOwn(field, function (val, key) {
            if (exp.validators[key] && !XP.includes(['map', 'multi', 'type'], key)) {
                if (XP.isError(err = exp.validators[key].method(value, field[key], name))) { throw err; }
            }
        });

        return value;
    };

    /*********************************************************************/

    /**
     * TODO DOC
     *
     * @property patterns
     * @type Object
     * @private
     */
    exp.patterns = {
        camelCase: XP.camelCaseRegex,
        capitalize: XP.capitalizeRegex,
        kebabCase: XP.kebabCaseRegex,
        keyCase: XP.keyCaseRegex,
        lowerCase: XP.lowerCaseRegex,
        readable: XP.readableRegex,
        snakeCase: XP.snakeCaseRegex,
        startCase: XP.startCaseRegex,
        trim: XP.trimRegex,
        upperCase: XP.upperCaseRegex
    };

    /**
     * TODO DOC
     *
     * @property types
     * @type Object
     * @private
     */
    exp.types = {
        any: XP.isAny,
        boolean: XP.isBoolean,
        number: XP.isFinite,
        object: XP.isObject,
        recursive: XP.isObject,
        string: XP.isString
    };

    /**
     * TODO DOC
     *
     * @property validators
     * @type Object
     * @private
     */
    exp.validators = {

        /**
         * Returns error if target is not array (based on bool)
         *
         * @param {*} target
         * @param {boolean} bool
         * @param {string} [name]
         * @returns {boolean | Error | null}
         * @private
         */
        multi: {input: 'checkbox', method: function (target, bool, name) {
            return XP.xor(bool, XP.isArray(target)) ? new XP.ValidationError(name || 'target', 'should be a multi') : null;
        }},

        /**
         * Returns error if target is not an map (based on bool)
         *
         * @param {*} target
         * @param {boolean} bool
         * @param {string} [name]
         * @returns {boolean | Error | null}
         * @private
         */
        map: {input: 'checkbox', multi: true, method: function (target, bool, name) {
            return XP.xor(bool, XP.isObject(target)) ? new XP.ValidationError(name || 'target', 'should be an map') : null;
        }},

        /**
         * Returns error if target is gte than max
         *
         * @param {number} target
         * @param {number} max
         * @param {string} [name]
         * @returns {boolean | Error | null}
         * @private
         */
        exclusiveMaximum: {input: 'number', type: 'number', method: function (target, max, name) {
            return !XP.isFinite(target) || !XP.isFinite(max) ? false : (target >= max ? new XP.ValidationError(name || 'target', 'should be less than ' + max) : null);
        }},

        /**
         * Returns error if target is lte than min
         *
         * @param {number} target
         * @param {number} min
         * @param {string} [name]
         * @returns {boolean | Error | null}
         * @private
         */
        exclusiveMinimum: {input: 'number', type: 'number', method: function (target, min, name) {
            return !XP.isFinite(target) || !XP.isFinite(min) ? false : (target <= min ? new XP.ValidationError(name || 'target', 'should be greater than ' + min) : null);
        }},

        /**
         * Returns error if target is gt than max
         *
         * @param {number} target
         * @param {number} max
         * @param {string} [name]
         * @returns {boolean | Error | null}
         * @private
         */
        maximum: {input: 'number', type: 'number', method: function (target, max, name) {
            return !XP.isFinite(target) || !XP.isFinite(max) ? false : (target > max ? new XP.ValidationError(name || 'target', 'should be a maximum of ' + max) : null);
        }},

        /**
         * Returns error if target length is gt than max
         *
         * @param {Array} target
         * @param {number} max
         * @param {string} [name]
         * @returns {boolean | Error | null}
         * @private
         */
        maxItems: {attributes: {min: 1}, input: 'number', multi: true, method: function (target, max, name) {
            return !XP.isArray(target) || !XP.isFinite(max) || max < 1 ? false : (target.length > max ? new XP.ValidationError(name || 'target', 'should be a maximum of ' + max + ' items') : null);
        }},

        /**
         * Returns error if target length is gt than max
         *
         * @param {string} target
         * @param {number} max
         * @param {string} [name]
         * @returns {boolean | Error | null}
         * @private
         */
        maxLength: {attributes: {min: 1}, input: 'number', type: 'string', method: function (target, max, name) {
            return !XP.isString(target) || !XP.isFinite(max) || max < 1 ? false : (target.length > max ? new XP.ValidationError(name || 'target', 'should be a maximum of ' + max + ' chars') : null);
        }},

        /**
         * Returns error if target is lt than min
         *
         * @param {number} target
         * @param {number} min
         * @param {string} [name]
         * @returns {boolean | Error|null}
         */
        minimum: {input: 'number', type: 'number', method: function (target, min, name) {
            return !XP.isFinite(target) || !XP.isFinite(min) ? false : (target < min ? new XP.ValidationError(name || 'target', 'should be a minimum of ' + min) : null);
        }},

        /**
         * Returns error if target length is lt than min
         *
         * @param {Array} target
         * @param {number} min
         * @param {string} [name]
         * @returns {boolean | Error | null}
         * @private
         */
        minItems: {attributes: {min: 1}, input: 'number', multi: true, method: function (target, min, name) {
            return !XP.isArray(target) || !XP.isFinite(min) ? false : (target.length < min ? new XP.ValidationError(name || 'target', 'should be a minimum of ' + min + ' items') : null);
        }},

        /**
         * Returns error if target length is lt than min
         *
         * @param {string} target
         * @param {number} min
         * @param {string} [name]
         * @returns {boolean | Error|null}
         */
        minLength: {attributes: {min: 1}, input: 'number', type: 'string', method: function (target, min, name) {
            return !XP.isString(target) || !XP.isFinite(min) ? false : (target.length < min ? new XP.ValidationError(name || 'target', 'should be a minimum of ' + min + ' chars') : null);
        }},

        /**
         * Returns error if target is not multiple of val
         *
         * @param {number} target
         * @param {number} val
         * @param {string} [name]
         * @returns {boolean | Error | null}
         * @private
         */
        multipleOf: {input: 'number', type: 'number', method: function (target, val, name) {
            return !XP.isFinite(target) || !XP.isFinite(val) ? false : (target % val !== 0 ? new XP.ValidationError(name || 'target', 'should be divisible by ' + val) : null);
        }},

        /**
         * Returns error if target matches pattern
         *
         * @param {string} target
         * @param {string} pattern
         * @param {string} [name]
         * @returns {boolean | Error | null}
         * @private
         */
        pattern: {input: 'text', options: XP.keys(exp.patterns), type: 'string', method: function (target, pattern, name) {
            var reg = XP.isString(target) && XP.isString(pattern, true) && (exp.patterns[pattern] || pattern);
            if (XP.isString(reg) && XP.isRegExp(reg = XP.toRegExp(pattern))) { exp.patterns[pattern] = reg; }
            return !reg ? false : (!reg.test(target) ? new XP.InvalidError(name || 'target') : null);
        }},

        /**
         * Returns error if target is empty (based on bool)
         *
         * @param {*} target
         * @param {boolean} bool
         * @param {string} [name]
         * @returns {boolean | Error | null}
         * @private
         */
        required: {input: 'checkbox', method: function (target, bool, name) {
            return bool && XP.isEmpty(target) ? new XP.RequiredError(name || 'target') : null;
        }},

        /**
         * Returns error if target type is not correct
         *
         * @param {*} target
         * @param {string} type
         * @param {string} [name]
         * @returns {boolean | Error|null}
         */
        type: {attributes: {required: true}, options: XP.keys(exp.types), method: function (target, type, name) {
            return XP.has(exp.types, type || 'any') && !exp.types[type || 'any'](target) && !XP.isNull(target) ? new XP.ArgumentError(name, type || 'any') : null;
        }},

        /**
         * Returns error if target includes duplicates (based on bool)
         *
         * @param {Array} target
         * @param {boolean} bool
         * @param {string} [name]
         * @returns {boolean | Error | null}
         * @private
         */
        uniqueItems: {input: 'checkbox', multi: true, method: function (target, bool, name) {
            return !XP.isArray(target) ? false : (bool && !XP.isUniq(target) ? new XP.ValidationError(name || 'target', 'should not have duplicates') : null);
        }}
    };

}(typeof window !== "undefined" ? window : global));
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"expandjs":1}]},{},[2])(2)
});