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
    declare function setTimeout(callback: Function, timeout: number): number;
    declare var global: any;
    declare var window: any;

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

    var globCatch: (result: {resolved: boolean; value: any;}) => void;

    class InnerPromise{

        private _internalPromise: Promise;
        private _internalPromiseFulfill: DoneAction;
        private _internalPromiseReject: DoneAction;

        constructor(private _onFulfillment: DoneAction,
                    private _onRejection: DoneAction) {

            this._internalPromise = new Promise(this._resolver.bind(this));

        }

        private _resolver(onFulfillment: DoneAction, onRejection: DoneAction): void {
            this._internalPromiseFulfill = onFulfillment;
            this._internalPromiseReject = onRejection;
        }

        public fulfill(value: any): void {
            var result: any = value;
            if (this._onFulfillment) {
                try{
                    result = this._onFulfillment.call(null, result);
                    this._internalPromiseFulfill(result);
                }catch(e){
                    this._internalPromiseReject(e);
                }
            }
        }

        public reject(value: any): void {
            var result: any = value;
            if (this._onRejection) {
                try{
                    result = this._onRejection.call(null, result);
                    this._internalPromiseFulfill(result);
                    return;
                }catch(e){
                    result = e;
                }
            }
            this._internalPromiseReject(result);
        }

        public promise(): Promise {
            return this._internalPromise;
        }
    }

    export class Promise{
        private _inners: InnerPromise[] = [];
        private _state: State = State.Pending;
        private _result: any;
        private _hasChain: boolean = false;

        constructor(resolver: (onFulfillment?: DoneAction, onRejection?: DoneAction) => void) {

            try{
                resolver(
                    this._handleFulfill.bind(this),
                    this._handleReject.bind(this));
            }catch(e){
                this._handleReject(e);
            }

        }

        public then(onFulfilled: DoneAction, onRejected?: DoneAction): Promise {
            var inner = new InnerPromise(onFulfilled, onRejected);
            this._hasChain = true;

            if (this._state !== State.Pending) {
                if (this._state === State.Fulfilled) {
                    async.bind(null, inner.fulfill, inner).call(null, this._result);
                    //child.fulfill.call(child, this._result);
                }

                if (this._state === State.Rejected) {
                    async.bind(null, inner.reject, inner).call(null, this._result);
                    //child.reject.call(child, this._result);
                }
            } else {
                this._inners.push(inner);
            }

            return inner.promise();
        }

        public "catch"(onRejected: DoneAction): Promise {
            return this.then(null, onRejected);
        }

        private _handleFulfill(result: any): void {
            var i = 0, l = this._inners.length,
                inner: InnerPromise;

            if (this._state !== State.Pending) {
                return;
            }
            if(isThenable(result)){
                this._handleThenable(result);
                return;
            };
            this._state = State.Fulfilled;
            for (; i < l; i++) {
                inner = this._inners[i];
                async.bind(null, inner.fulfill, inner).call(null, result);
                //child.fulfill.call(child, result);
            }
            this._inners = [];
            this._result = result;
        }

        private _handleReject(result: any): void {
            var i = 0, l = this._inners.length,
                inner: InnerPromise;
            if (this._state !== State.Pending) {
                return;
            }
            //if(isThenable(result)){
            //    this._handleThenable(result);
            //    return;
            //};
            this._state = State.Rejected;
            for (; i < l; i++) {
                inner = this._inners[i];
                async.bind(null, inner.reject, inner).call(null, result);
                //child.reject.call(child, result);
            }
            this._inners = [];
            this._result = result;
            if(l === 0){
                //TOOD: global handler
                if(globCatch){
                    async(globCatch, null, {
                        value: result,
                        resolved: true
                    });
                    //globCatch();
                }
            }
        }

        private _handleThenable(thenable: {then: (onFulfilled: DoneAction, onRejected?: DoneAction) => any}): void {
            thenable.then((result) => {
                this._handleFulfill(result);
            }, (result) => {
                this._handleReject(result);
            });
        }


        public static resolve(value: any): Promise {
            return new Promise((onFulfilled, onRejected) => {
                onFulfilled(value);
            });
        }

        public static reject(value: any): Promise {
            return new Promise((onFulfilled, onRejected) => {
                onRejected(value);
            });
        }

        public static globalCatch(value?: (result: {resolved: boolean; value: any;}) => void): void {
            globCatch = value;
        }
    }
}
