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
function isArray(value) {
    if (!value) {
        return false;
    }
    return Object.prototype.toString.call(value) === "[object Array]";
}
exports.isArray = isArray;
//# sourceMappingURL=util.js.map