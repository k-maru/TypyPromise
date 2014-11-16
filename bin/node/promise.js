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