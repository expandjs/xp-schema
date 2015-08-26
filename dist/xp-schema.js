(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.XPSchema = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
/*jslint browser: true, devel: true, node: true, ass: true, nomen: true, unparam: true, indent: 4 */

module.exports = require('./lib');
},{"./lib":3}],3:[function(require,module,exports){
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
    var eventemitter3 = require('eventemitter3'),
        XP            = global.XP || require('expandjs');

    /*********************************************************************/

    /**
     * This class is used to provide event emitting functionalities.
     *
     * @class XPEmitter
     * @description This class is used to provide event emitting functionalities
     */
    module.exports = new XP.Class('XPEmitter', {

        // EXTENDS
        extends: eventemitter3
    });

}(typeof window !== "undefined" ? window : global));
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"eventemitter3":4,"expandjs":1}],4:[function(require,module,exports){
'use strict';

/**
 * Representation of a single EventEmitter function.
 *
 * @param {Function} fn Event handler to be called.
 * @param {Mixed} context Context for function execution.
 * @param {Boolean} once Only emit once
 * @api private
 */
function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

/**
 * Minimal EventEmitter interface that is molded against the Node.js
 * EventEmitter interface.
 *
 * @constructor
 * @api public
 */
function EventEmitter() { /* Nothing to set */ }

/**
 * Holds the assigned EventEmitters by name.
 *
 * @type {Object}
 * @private
 */
EventEmitter.prototype._events = undefined;

/**
 * Return a list of assigned event listeners.
 *
 * @param {String} event The events that should be listed.
 * @returns {Array}
 * @api public
 */
EventEmitter.prototype.listeners = function listeners(event) {
  if (!this._events || !this._events[event]) return [];
  if (this._events[event].fn) return [this._events[event].fn];

  for (var i = 0, l = this._events[event].length, ee = new Array(l); i < l; i++) {
    ee[i] = this._events[event][i].fn;
  }

  return ee;
};

/**
 * Emit an event to all registered event listeners.
 *
 * @param {String} event The name of the event.
 * @returns {Boolean} Indication if we've emitted an event.
 * @api public
 */
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  if (!this._events || !this._events[event]) return false;

  var listeners = this._events[event]
    , len = arguments.length
    , args
    , i;

  if ('function' === typeof listeners.fn) {
    if (listeners.once) this.removeListener(event, listeners.fn, true);

    switch (len) {
      case 1: return listeners.fn.call(listeners.context), true;
      case 2: return listeners.fn.call(listeners.context, a1), true;
      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len -1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    listeners.fn.apply(listeners.context, args);
  } else {
    var length = listeners.length
      , j;

    for (i = 0; i < length; i++) {
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, true);

      switch (len) {
        case 1: listeners[i].fn.call(listeners[i].context); break;
        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
        default:
          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
            args[j - 1] = arguments[j];
          }

          listeners[i].fn.apply(listeners[i].context, args);
      }
    }
  }

  return true;
};

/**
 * Register a new EventListener for the given event.
 *
 * @param {String} event Name of the event.
 * @param {Functon} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.on = function on(event, fn, context) {
  var listener = new EE(fn, context || this);

  if (!this._events) this._events = {};
  if (!this._events[event]) this._events[event] = listener;
  else {
    if (!this._events[event].fn) this._events[event].push(listener);
    else this._events[event] = [
      this._events[event], listener
    ];
  }

  return this;
};

/**
 * Add an EventListener that's only called once.
 *
 * @param {String} event Name of the event.
 * @param {Function} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.once = function once(event, fn, context) {
  var listener = new EE(fn, context || this, true);

  if (!this._events) this._events = {};
  if (!this._events[event]) this._events[event] = listener;
  else {
    if (!this._events[event].fn) this._events[event].push(listener);
    else this._events[event] = [
      this._events[event], listener
    ];
  }

  return this;
};

/**
 * Remove event listeners.
 *
 * @param {String} event The event we want to remove.
 * @param {Function} fn The listener that we need to find.
 * @param {Boolean} once Only remove once listeners.
 * @api public
 */
EventEmitter.prototype.removeListener = function removeListener(event, fn, once) {
  if (!this._events || !this._events[event]) return this;

  var listeners = this._events[event]
    , events = [];

  if (fn) {
    if (listeners.fn && (listeners.fn !== fn || (once && !listeners.once))) {
      events.push(listeners);
    }
    if (!listeners.fn) for (var i = 0, length = listeners.length; i < length; i++) {
      if (listeners[i].fn !== fn || (once && !listeners[i].once)) {
        events.push(listeners[i]);
      }
    }
  }

  //
  // Reset the array, or remove it completely if we have no more listeners.
  //
  if (events.length) {
    this._events[event] = events.length === 1 ? events[0] : events;
  } else {
    delete this._events[event];
  }

  return this;
};

/**
 * Remove all listeners or only the listeners for the specified event.
 *
 * @param {String} event The event want to remove all listeners for.
 * @api public
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  if (!this._events) return this;

  if (event) delete this._events[event];
  else this._events = {};

  return this;
};

//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// This function doesn't apply anymore.
//
EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
  return this;
};

//
// Expose the module.
//
EventEmitter.EventEmitter = EventEmitter;
EventEmitter.EventEmitter2 = EventEmitter;
EventEmitter.EventEmitter3 = EventEmitter;

//
// Expose the module.
//
module.exports = EventEmitter;

},{}],5:[function(require,module,exports){
arguments[4][2][0].apply(exports,arguments)
},{"./lib":7,"dup":2}],6:[function(require,module,exports){
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
},{"expandjs":1}],7:[function(require,module,exports){
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
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./filter":6,"./sanitize":8,"./validate":9,"expandjs":1,"xp-emitter":2}],8:[function(require,module,exports){
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
     */
    exp.sanitizers = {

        /**
         * Returns map representation of target (based on bool)
         *
         * @param {*} target
         * @param {boolean} bool
         * @returns {*}
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
         */
        type: {method: function (target, type) {
            return type === 'boolean' ? !!target : target;
        }}
    };

}(typeof window !== "undefined" ? window : global));
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"expandjs":1}],9:[function(require,module,exports){
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
     */
    exp.validators = {

        /**
         * Returns error if target is not array (based on bool)
         *
         * @param {*} target
         * @param {boolean} bool
         * @param {string} [name]
         * @returns {boolean | Error | null}
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
         */
        uniqueItems: {input: 'checkbox', multi: true, method: function (target, bool, name) {
            return !XP.isArray(target) ? false : (bool && !XP.isUniq(target) ? new XP.ValidationError(name || 'target', 'should not have duplicates') : null);
        }}
    };

}(typeof window !== "undefined" ? window : global));
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"expandjs":1}]},{},[5])(5)
});