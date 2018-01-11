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
    filter    = require('./methods/filter'),
    map       = require('./methods/map'),
    restrict  = require('./methods/restrict'),
    sanitize  = require('./methods/sanitize'),
    validate  = require('./methods/validate');

/*********************************************************************/

/**
 * A class used to provide scheming functionality.
 *
 * @class XPSchema
 * @extends XPEmitter /bower_components/xp-emitter/lib/index.js
 * @description A class used to provide scheming functionality
 * @keywords nodejs, expandjs
 * @source https://github.com/expandjs/xp-schema/blob/master/lib/index.js
 */
module.exports = new XP.Class('XPSchema', {

    // EXTENDS
    extends: XPEmitter,

    /*********************************************************************/
    /* INITIALIZER */
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
    /* GETTERS */
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
    /* METHODS */
    /*********************************************************************/

    /**
     * Filters the provided `item`, removing the reserved fields.
     * The `callback` is invoked with two arguments: (`error`, `item`).
     *
     * @method filter
     * @param {Object} item
     * @param {Object} [options]
     *   @param {boolean} [options.reading = false]
     * @param {Function} [callback]
     * @returns {Promise}
     */
    filter: {
        promise: true,
        value(item, options, callback) {

            // Waterfall
            XP.waterfall([
                next => this._assert({item}, next), // asserting
                next => XP.attempt(next => next(null, filter(this, item, options)), next) // filtering
            ], callback);
        }
    },

    /**
     * Maps the provided `item`, replacing each alias with its real key.
     * The `callback` is invoked with two arguments: (`error`, `item`).
     *
     * @method map
     * @param {Object} item
     * @param {Object} [options]
     *   @param {boolean} [options.reading = false]
     * @param {Function} [callback]
     * @returns {Promise}
     */
    map: {
        promise: true,
        value(item, options, callback) {

            // Waterfall
            XP.waterfall([
                next => this._assert({item, options}, next), // asserting
                next => XP.attempt(next => next(null, this.mapped ? map(this, item, options) : item), next) // mapping
            ], callback);
        }
    },

    /**
     * Restricts the provided `item`, removing the unknown fields, base on their aliases.
     * The `callback` is invoked with two arguments: (`error`, `item`).
     *
     * @method restrict
     * @param {Object} item
     * @param {Object} [options]
     * @param {Function} [callback]
     * @returns {Promise}
     */
    restrict: {
        promise: true,
        value(item, options, callback) {

            // Waterfall
            XP.waterfall([
                next => this._assert({item, options}, next), // asserting
                next => XP.attempt(next => next(null, restrict(this, item, options)), next) // restricting
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
     * @param {Object} item
     * @param {Object} [options]
     *   @param {Object} [options.current]
     *   @param {string} [options.path]
     * @param {Function} [callback]
     * @returns {Promise}
     */
    sanitize: {
        promise: true,
        value(item, options, callback) {

            // Waterfall
            XP.waterfall([
                next => this._assert({item, options}, next), // asserting
                next => XP.attempt(next => next(null, sanitize(this, item, options)), next) // sanitizing
            ], callback);
        }
    },

    /**
     * Validates the provided `item` based on the schema.
     * The `callback` is invoked with two arguments: (`error`, `item`).
     *
     * A 3rd parameter can be provided to specify the `current` state of `item` to compare with.
     *
     * @method validate
     * @param {Object} item
     * @param {Object} [options]
     *   @param {Object} [options.current]
     *   @param {string} [options.path]
     * @param {Function} [callback]
     * @returns {Promise}
     */
    validate: {
        promise: true,
        value(item, options, callback) {

            // Waterfall
            XP.waterfall([
                next => this._assert({item, options}, next), // asserting
                next => XP.attempt(next => next(null, validate(this, item, options)), next) // validating
            ], callback);
        }
    },

    /*********************************************************************/
    /* PRIVATE */
    /*********************************************************************/

    /**
     * A method used internally to validate the provided arguments.
     *
     * @method _assert
     * @param {Object} values
     * @param {Function} callback
     * @private
     */
    _assert(values, callback) {

        // Asserting
        XP.iterate(values, (next, value, key) => next(this['_assert' + XP.capitalize(key)](value)), callback);
    },

    /*********************************************************************/
    /* PROPERTIES */
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
        set(val) { return XP.isDefined(this.mapped) ? this.mapped : Boolean(val); }
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
    /* ASSERTS */
    /*********************************************************************/

    _assertItem(val) { return !XP.isObject(val) && XP.ValidationError('item', 'Object'); },
    _assertOptions(val) { return !XP.isVoid(val) && !XP.isObject(val) && XP.ValidationError('options', 'Object'); }
});

/*********************************************************************/

// Globalizing
if (typeof window !== "undefined") { window.XPSchema = module.exports; }
