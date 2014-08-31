if (!Function.prototype.bind) {
    function Empty() { }

    Function.prototype.bind = function bind(context) {
        var target = this,
            args = Array.prototype.slice.call(arguments, 1),
            bound = function () {
                if (this instanceof bound) {
                    var result = target.apply(
                        this,
                        args.concat(Array.prototype.slice.call(arguments))
                    );
                    if (Object(result) === result) {
                        return result;
                    }
                    return this;
                } else {
                    return target.apply(
                        context,
                        args.concat(Array.prototype.slice.call(arguments))
                    );
                }

            };
        if (target.prototype) {
            Empty.prototype = target.prototype;
            bound.prototype = new Empty();
            Empty.prototype = null;
        }
        return bound;
    };
}

module Typy{

    declare function setImmediate(callback: Function): void;
    declare var global: any;

    export interface DoneAction{
        (args: any): void;
    }

    enum State {
        Pending,
        Fulfilled,
        Rejected
    }

    function async(callback: Function, context: any, ...args: any[]): void{
        if((window || global).setImmediate){
            setImmediate(() => {
                callback.apply(context, args);
            });
        }else{
            setTimeout(() => {
                callback.apply(context, args);
            }, 0);
        }
    }

    function isThenable(value: any): boolean{
        if(!value){
            return false;
        }
        return Object.prototype.toString.call(value.then) === "[object Function]";
    }

    class InnerPromise{

        private _internalPromise: Promise;
        private _internalPromiseFulfill: DoneAction;
        private _internalPromiseReject: DoneAction;
        private _id = Date.now();

        constructor(private _onFulfillment: DoneAction,
                    private _onRejection: DoneAction) {

            this._internalPromise = new Promise(this._resolver.bind(this));

        }

        private _resolver(onFulfillment: DoneAction, onRejection: DoneAction): void {
            this._internalPromiseFulfill = onFulfillment;
            this._internalPromiseReject = onRejection;
        }

        public fulfill(value: any): void {
            var result: any;
            if (this._onFulfillment) {
                result = this._onFulfillment.call(null, value);
                this._internalPromiseFulfill(result);
            }
        }

        public reject(value: any): void {
            var result: any;
            if (this._onRejection) {
                result = this._onRejection.call(null, value);
                this._internalPromiseFulfill(result);
            }
        }

        public promise(): Promise {
            return this._internalPromise;
        }
    }

    export class Promise{
        private _deferreds: InnerPromise[] = [];
        private _state: State = State.Pending;
        private _result: any;
        private _id: number = Date.now();

        constructor(resolver: (onFulfillment?: DoneAction, onRejection?: DoneAction) => void) {
            resolver(
                this._handleFulfill.bind(this),
                this._handleReject.bind(this));
        }

        public then(onFulfilled: DoneAction, onRejected?: DoneAction): Promise {
            var child = new InnerPromise(onFulfilled, onRejected);

            if (this._state !== State.Pending) {
                if (this._state === State.Fulfilled) {
                    async.bind(null, child.fulfill, child).call(null, this._result);
                    //child.fulfill.call(child, this._result);
                }

                if (this._state === State.Rejected) {
                    async.bind(null, child.reject, child).call(null, this._result);
                    //child.reject.call(child, this._result);
                }
            } else {
                this._deferreds.push(child);
            }

            return child.promise();
        }

        public "catch"(onRejected: DoneAction): Promise {
            return this.then(null, onRejected);
        }

        private _handleFulfill(result: any): void {
            var i = 0, l = this._deferreds.length,
                child: InnerPromise;

            if (this._state !== State.Pending) {
                return;
            }
            this._state = State.Fulfilled;
            for (; i < l; i++) {
                child = this._deferreds[i];
                async.bind(null, child.fulfill, child).call(null, result);
                //child.fulfill.call(child, result);
            }
            this._deferreds = [];
            this._result = result;
        }

        private _handleReject(result: any): void {
            var i = 0, l = this._deferreds.length,
                child: InnerPromise;
            if (this._state !== State.Pending) {
                return;
            }
            this._state = State.Rejected;
            for (; i < l; i++) {
                child = this._deferreds[i];
                async.bind(null, child.reject, child).call(null, result);
                //child.reject.call(child, result);
            }
            this._deferreds = [];
            this._result = result;
        }


        public static resolve(value: any): Promise {
            return new Promise((onFulfilled, onRejected) => {
                if(isThenable(value)){
                    value.then((result: any) => {
                        onFulfilled(result);
                    }, (result: any) => {
                        onRejected(result);
                    });
                }else{
                    onFulfilled(value);
                }
            });
        }

        public static reject(value: any): Promise {
            return new Promise((onFulfilled, onRejected) => {
                onRejected(value);
            });
        }
    }
}