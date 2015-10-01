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
    var XP         = global.XP || require('expandjs'),
        XPEmitter  = global.XPEmitter || require('xp-emitter'),

        filter     = require('./filter'),
        prepare    = require('./prepare'),
        sanitize   = require('./sanitize'),
        validate   = require('./validate'),

        filterer   = function (item) { return XP.has(item, 'input') || XP.has(item, 'options'); },
        mapper     = function (item, handle) { item = XP.assign({handle: handle}, item); XP.withdraw(item, 'method'); return item; },

        types      = XP.freeze(XP.keys(validate.types)),
        sanitizers = XP.freeze(XP.filter(XP.map(sanitize.sanitizers, mapper), filterer)),
        validators = XP.freeze(XP.filter(XP.map(validate.validators, mapper), filterer));

    /*********************************************************************/

    /**
     * This class is used to provide scheming functionalities, including sanitization and validation.
     *
     * @class XPSchema
     * @description This class is used to provide scheming functionalities, including sanitization and validation
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
         *   @param {boolean} [options.loose = false]
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
            self.loose   = self.options.loose || false;
            self.useful  = self.options.useful || false;
        },

        /*********************************************************************/

        /**
         * Filters the data.
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
                    function (next) { XP.attempt(function (next) { next(null, filter(data, self.fields)); }, next); } // filtering
                ], resolver);
            }
        },

        /**
         * Prepares the data.
         *
         * @method filter
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
                    function (next) { XP.attempt(function (next) { next(null, prepare(data, self.fields)); }, next); } // preparing
                ], resolver);
            }
        },

        /**
         * Sanitizes the data.
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
                    function (next) { XP.attempt(function (next) { next(null, sanitize(data, self.fields, self.options)); }, next); } // sanitizing
                ], resolver);
            }
        },

        /**
         * Validates the data.
         *
         * @method validate
         * @param {Object} data
         * @param {Function} [resolver]
         * @returns {Promise}
         */
        validate: {
            promise: true,
            value: function (data, resolver) {
                var self = this;
                XP.waterfall([
                    function (next) { self._assert({data: data}, next); }, // asserting
                    function (next) { XP.attempt(function (next) { next(null, validate(data, self.fields, self.options)); }, next); } // validating
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
         * @property loose
         * @type boolean
         */
        loose: {
            set: function (val) { return !!val; }
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
        },

        /*********************************************************************/

        // ASSERTS
        _assertData: {enumerable: false, value: function (val) { return !XP.isObject(val) && new XP.ValidationError('data', 'Object', 400); }}
    });

}(typeof window !== "undefined" ? window : global));