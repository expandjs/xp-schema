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
        XPEmitter = global.XPEmitter || require('xp-emitter'),

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
     * @extends XPEmitter
     */
    module.exports = new XP.Class('XPSchema', {

        // EXTENDS
        extends: XPEmitter,

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

            // Super
            XPEmitter.call(self);

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
                XP.attempt(function (next) { next(null, filter(self._ensure(target, 'target'), self.fields, self.options)); }, resolver);
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
                XP.attempt(function (next) { next(null, sanitize(self._ensure(target, 'target'), self.fields, self.options)); }, resolver);
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
                XP.attempt(function (next) { next(null, validate(self._ensure(target, 'target'), self.fields, self.options)); }, resolver);
            }
        },

        /*********************************************************************/

        /**
         * Used internally
         *
         * @method _ensure
         * @param {*} target
         * @param {string} [name]
         * @returns {*}
         * @private
         */
        _ensure: {
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