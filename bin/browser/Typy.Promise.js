(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var util = require("./util");
var Typy;
(function (Typy) {
    var State;
    (function (State) {
        State[State["Pending"] = 0] = "Pending";
        State[State["Fulfilled"] = 1] = "Fulfilled";
        State[State["Rejected"] = 2] = "Rejected";
    })(State || (State = {}));
    var InnerPromise = (function () {
        function InnerPromise(_onFulfillment, _onRejection) {
            this._onFulfillment = _onFulfillment;
            this._onRejection = _onRejection;
            this._internalPromise = new Promise(util.bind(this._resolver, this));
        }
        InnerPromise.prototype._resolver = function (onFulfillment, onRejection) {
            this._internalPromiseFulfill = onFulfillment;
            this._internalPromiseReject = onRejection;
        };
        InnerPromise.prototype.fulfill = function (value) {
            var result = value;
            if (this._onFulfillment) {
                try {
                    result = this._onFulfillment.call(null, result);
                    this._internalPromiseFulfill(result);
                }
                catch (e) {
                    this._internalPromiseReject(e);
                }
            }
        };
        InnerPromise.prototype.reject = function (value) {
            var result = value;
            if (this._onRejection) {
                try {
                    result = this._onRejection.call(null, result);
                    this._internalPromiseFulfill(result);
                    return;
                }
                catch (e) {
                    result = e;
                }
            }
            this._internalPromiseReject(result);
        };
        InnerPromise.prototype.promise = function () {
            return this._internalPromise;
        };
        return InnerPromise;
    })();
    function handleFulfill(result) {
        var i = 0, l = this._inners.length, inner;
        if (this._state !== 0 /* Pending */) {
            return;
        }
        if (util.isThenable(result)) {
            handleThenable.call(this, result);
            return;
        }
        ;
        this._state = 1 /* Fulfilled */;
        for (; i < l; i++) {
            inner = this._inners[i];
            util.bind(util.async, null, inner.fulfill, inner).call(null, result);
        }
        this._inners = [];
        this._result = result;
    }
    function handleReject(result) {
        var i = 0, l = this._inners.length, inner;
        if (this._state !== 0 /* Pending */) {
            return;
        }
        this._state = 2 /* Rejected */;
        for (; i < l; i++) {
            inner = this._inners[i];
            util.bind(util.async, null, inner.reject, inner).call(null, result);
        }
        this._inners = [];
        this._result = result;
    }
    function handleThenable(thenable) {
        var self = this;
        thenable.then(function (result) {
            handleFulfill.call(self, result);
        }, function (result) {
            handleReject.call(self, result);
        });
    }
    var Promise = (function () {
        function Promise(resolver) {
            this._inners = [];
            this._state = 0 /* Pending */;
            try {
                resolver(util.bind(handleFulfill, this), util.bind(handleReject, this));
            }
            catch (e) {
                handleReject.call(this, e);
            }
        }
        Promise.prototype.then = function (onFulfilled, onRejected) {
            var inner = new InnerPromise(onFulfilled, onRejected);
            if (this._state !== 0 /* Pending */) {
                if (this._state === 1 /* Fulfilled */) {
                    util.bind(util.async, null, inner.fulfill, inner).call(null, this._result);
                }
                if (this._state === 2 /* Rejected */) {
                    util.bind(util.async, null, inner.reject, inner).call(null, this._result);
                }
            }
            else {
                this._inners.push(inner);
            }
            return inner.promise();
        };
        Promise.prototype["catch"] = function (onRejected) {
            return this.then(null, onRejected);
        };
        Promise.resolve = function (value) {
            if (value instanceof Promise) {
                return value;
            }
            if (util.isThenable(value)) {
                return new Promise(function (onFulfilled, onRejected) {
                    util.async(function () {
                        value.then(onFulfilled, onRejected);
                    }, null);
                });
            }
            return new Promise(function (onFulfilled, onRejected) {
                onFulfilled(value);
            });
        };
        Promise.reject = function (value) {
            return new Promise(function (onFulfilled, onRejected) {
                onRejected(value);
            });
        };
        return Promise;
    })();
    Typy.Promise = Promise;
})(Typy || (Typy = {}));
module.exports = Typy;
//# sourceMappingURL=promise.js.map
},{"./util":2}],2:[function(require,module,exports){
(function (global){
function bind(target, context) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    if (Function.prototype.bind) {
        args.unshift(context);
        return Function.prototype.bind.apply(target, args);
    }
    return function () {
        var relArgs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            relArgs[_i - 0] = arguments[_i];
        }
        var a = args.concat(relArgs);
        return target.apply(context, a);
    };
}
exports.bind = bind;
function async(callback, context) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    var glob = typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {};
    if (glob.setImmediate) {
        glob.setImmediate(function () {
            callback.apply(context, args);
        });
    }
    else {
        setTimeout(function () {
            callback.apply(context, args);
        }, 0);
    }
}
exports.async = async;
function isThenable(value) {
    if (!value) {
        return false;
    }
    return Object.prototype.toString.call(value.then) === "[object Function]";
}
exports.isThenable = isThenable;
//# sourceMappingURL=util.js.map
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],3:[function(require,module,exports){
var Typy = require("../bin/node/promise.js");
if(window.Typy){
    window.Typy.Promise = Typy.Promise;
}else{
    window.Typy = Typy;
}

},{"../bin/node/promise.js":1}]},{},[3,1,2]);
