/**
 * @license
 * Copyright (c) 2017 The expand.js authors. All rights reserved.
 * This code may only be used under the BSD style license found at https://expandjs.github.io/LICENSE.txt
 * The complete set of authors may be found at https://expandjs.github.io/AUTHORS.txt
 * The complete set of contributors may be found at https://expandjs.github.io/CONTRIBUTORS.txt
 */

// Const
const env     = typeof window !== "undefined" ? window : global,
    XP        = env.XP || require('expandjs'),
    XPEmitter = env.XPEmitter || require('xp-emitter'),

    filter    = require('./functions/filter'),
    map       = require('./functions/map'),
    restrict  = require('./functions/restrict'),
    sanitize  = require('./functions/sanitize'),
    validate  = require('./functions/validate');

/*********************************************************************/

/**
 * A class used to provide scheming functionality.
 *
 * @class XPSchema
 * @extends XPEmitter /bower_components/xp-emitter/lib/index.js
 * @since 1.0.0
 * @description A class used to provide scheming functionality
 * @keywords nodejs, expandjs
 * @source https://github.com/expandjs/xp-schema/blob/master/lib/index.js
 */
module.exports = env.XPSchema = new XP.Class('XPSchema', {

    // EXTENDS
    extends: XPEmitter,

    /*********************************************************************/

    /**
     * @constructs
     * @param {Object} fields
     */
    initialize(fields) {

        // Super
        XPEmitter.call(this);

        // Setting
        this.fields = fields;
        this.mapped = XP.findDeep(this.fields, field => field && XP.isString(field.alias, true));
    },

    /*********************************************************************/

    /**
     * Returns the field at the provided `path`.
     *
     * @method getField
     * @param {string} path
     * @returns {Object}
     */
    getField(path) {

        // Asserting
        XP.assertArgument(XP.isVoid(path) || XP.isString(path, true), 1, 'string');

        // Checking
        if (!path) { return null; }

        // Let
        let field  = this,
            fields = this.fields,
            parts  = path.split('.');

        // Mapping
        parts = parts.map(part => {
            fields = field && field.fields;
            part   = Object.keys(fields || {}).find(key => part === fields[key].alias) || part;
            field  = fields && fields[part];
            return part;
        });

        // Getting
        return XP.get(this.fields, parts.join('.')) || null;
    },

    /*********************************************************************/

    /**
     * Filters the provided `item`, removing the reserved fields.
     * The `callback` is invoked with two arguments: (`error`, `item`).
     *
     * A 2nd parameter can be provided to specify if the readonly fields should be removed too.
     *
     * @method filter
     * @param {Object} item
     * @param {boolean} [reading = false]
     * @param {Function} [callback]
     */
    filter: {
        callback: true,
        value(item, reading, callback) {
            XP.waterfall([
                next => this._assert({item: item}, next), // asserting
                next => next(null, filter(this, item, {reading: reading})) // filtering
            ], callback);
        }
    },

    /**
     * Maps the provided `item`, replacing each alias with its real key.
     * The `callback` is invoked with two arguments: (`error`, `item`).
     *
     * A 2nd parameter can be provided to specify if the replacing operation should be reversed.
     *
     * @method map
     * @param {Object} item
     * @param {boolean} [reading = false]
     * @param {Function} [callback]
     */
    map: {
        callback: true,
        value(item, reading, callback) {
            XP.waterfall([
                next => this._assert({item: item}, next), // asserting
                next => next(null, this.mapped ? map(this, item, {reading: reading}) : item) // mapping
            ], callback);
        }
    },

    /**
     * Restricts the provided `item`, removing the unknown fields, base on their aliases.
     * The `callback` is invoked with two arguments: (`error`, `item`).
     *
     * A 2nd parameter can be provided to specify if the removing operation should be based on the real keys.
     *
     * @method restrict
     * @param {Object} item
     * @param {boolean} [reading = false]
     * @param {Function} [callback]
     */
    restrict: {
        callback: true,
        value(item, reading, callback) {
            XP.waterfall([
                next => this._assert({item: item}, next), // asserting
                next => next(null, restrict(this, item, {reading: reading})) // restricting
            ], callback);
        }
    },

    /**
     * Sanitizes the provided `item` based on the schema.
     * The `callback` is invoked with two arguments: (`error`, `item`).
     *
     * A 3rd parameter can be provided to specify the `current` state of `item` to compare with.
     *
     * @method sanitize
     * @param {string} namespace
     * @param {Object} item
     * @param {Object} [current]
     * @param {Function} [callback]
     */
    sanitize: {
        callback: true,
        value(namespace, item, current, callback) {
            XP.waterfall([
                next => this._assert({namespace: namespace, item: item, current: current}, next), // asserting
                next => XP.attempt(next => next(null, sanitize(this, item, {current: current, path: namespace})), next) // sanitizing
            ], error => callback(error ? error : null));
        }
    },

    /**
     * Validates the provided `item` based on the schema.
     * The `callback` is invoked with two arguments: (`error`, `item`).
     *
     * A 3rd parameter can be provided to specify the `current` state of `item` to compare with.
     *
     * @method validate
     * @param {string} namespace
     * @param {Object} item
     * @param {Object} [current]
     * @param {Function} [callback]
     */
    validate: {
        callback: true,
        value(namespace, item, current, callback) {
            XP.waterfall([
                next => this._assert({namespace: namespace, item: item, current: current}, next), // asserting
                next => XP.attempt(next => next(null, validate(this, item, {current: current, path: namespace})), next) // validating
            ], callback);
        }
    },

    /*********************************************************************/

    /**
     * A method used internally to validate the provided arguments.
     *
     * @method _assert
     * @param {Object} values
     * @param {Function} [callback]
     * @private
     */
    _assert: {
        callback: true,
        enumerable: false,
        value(values, callback) {
            XP.iterate(values, (next, value, key) => next(this['_assert' + XP.capitalize(key)](value)), callback);
        }
    },

    /*********************************************************************/

    /**
     * The schema's fields.
     *
     * @property fields
     * @type Object
     */
    fields: {
        set(val) { return this.fields || val; },
        validate(val) { return !XP.isObject(val) && 'Object'; }
    },

    /**
     * If set to true, there's at least on field with an alias.
     *
     * @property mapped
     * @type boolean
     * @default false
     * @readonly
     */
    mapped: {
        set(val) { return XP.isDefined(this.mapped) ? this.mapped : !!val; }
    },

    /**
     * The list of possible sanitizers.
     *
     * @property sanitizers
     * @type Array
     * @readonly
     * @static
     */
    sanitizers: {
        static: true,
        writable: false,
        value: Object.freeze(Object.keys(sanitize.sanitizers))
    },

    /**
     * The list of possible field types.
     *
     * @property types
     * @type Array
     * @readonly
     * @static
     */
    types: {
        static: true,
        writable: false,
        value: Object.freeze(Object.keys(validate.types))
    },

    /**
     * The list of possible validators.
     *
     * @property validators
     * @type Array
     * @readonly
     * @static
     */
    validators: {
        static: true,
        writable: false,
        value: Object.freeze(Object.keys(validate.validators))
    },

    /*********************************************************************/

    // ASSERTS
    _assertCurrent: {enumerable: false, value(val) { return !XP.isVoid(val) && !XP.isObject(val) && XP.error(400, 'Schema failed due to invalid "current"'); }},
    _assertItem: {enumerable: false, value(val) { return !XP.isObject(val) && XP.error(400, 'Schema failed due to invalid "item"'); }},
    _assertNamespace: {enumerable: false, value(val) { return !XP.isVoid(val) && !XP.isString(val) && XP.error(400, 'Schema failed due to invalid "namespace"'); }}
});
