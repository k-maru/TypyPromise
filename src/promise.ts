import util = require("./util");

module Typy{

    export interface DoneAction{
        (args: any): void;
    }

    enum State {
        Pending,
        Fulfilled,
        Rejected
    }

    class InnerPromise{

        private _internalPromise: Promise;
        private _internalPromiseFulfill: DoneAction;
        private _internalPromiseReject: DoneAction;

        constructor(private _onFulfillment: DoneAction,
                    private _onRejection: DoneAction) {

            this._internalPromise = new Promise(util.bind(this._resolver,this));

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

    function handleFulfill(result: any): void {
        var i = 0, l = this._inners.length,
            inner: InnerPromise;

        if (this._state !== State.Pending) {
            return;
        }
        if(util.isThenable(result)){
            handleThenable.call(this, result);
            return;
        };
        this._state = State.Fulfilled;
        for (; i < l; i++) {
            inner = this._inners[i];
            util.bind(util.async, null, inner.fulfill, inner).call(null, result);
        }
        this._inners = [];
        this._result = result;
    }

    function handleReject(result: any): void {
        var i = 0, l = this._inners.length,
            inner: InnerPromise;
        if (this._state !== State.Pending) {
            return;
        }
        this._state = State.Rejected;
        for (; i < l; i++) {
            inner = this._inners[i];
            util.bind(util.async, null, inner.reject, inner).call(null, result);
        }
        this._inners = [];
        this._result = result;
    }

    function handleThenable(thenable: {then: (onFulfilled: DoneAction, onRejected?: DoneAction) => any}): void {
        var self = this;

        thenable.then((result) => {
            handleFulfill.call(self, result);
        }, (result) => {
            handleReject.call(self, result);
        });
    }

    export class Promise{

        private _inners: InnerPromise[] = [];
        private _state: State = State.Pending;
        private _result: any;

        constructor(resolver: (onFulfillment?: DoneAction, onRejection?: DoneAction) => void) {
            try{
                resolver(
                    util.bind(handleFulfill, this),
                    util.bind(handleReject, this)
                );
            }catch(e){

                handleReject.call(this, e);
            }
        }

        public then(onFulfilled: DoneAction, onRejected?: DoneAction): Promise {
            var inner = new InnerPromise(onFulfilled, onRejected);

            if (this._state !== State.Pending) {
                if (this._state === State.Fulfilled) {
                    util.bind(util.async, null, inner.fulfill, inner).call(null, this._result);
                }

                if (this._state === State.Rejected) {
                    util.bind(util.async, null, inner.reject, inner).call(null, this._result);
                }
            } else {
                this._inners.push(inner);
            }

            return inner.promise();
        }

        public "catch"(onRejected: DoneAction): Promise {
            return this.then(null, onRejected);
        }

        public static resolve(value: any): Promise {
            if(value instanceof Promise){
                return value;
            }
            if(util.isThenable(value)){
                return new Promise((onFulfilled, onRejected) => {
                    util.async(() => {
                        value.then(onFulfilled, onRejected);
                    }, null);
                });
            }
            return new Promise((onFulfilled, onRejected) => {
                onFulfilled(value);
            });
        }

        public static reject(value: any): Promise {
            return new Promise((onFulfilled, onRejected) => {
                onRejected(value);
            });
        }

        public static all(values: any[]): Promise {

            return new Promise((onFulfilled, onRejected) => {
                var i = 0, length, results: any = [],
                    resolvedLength = 0,
                    completed = false;
                //TODO: iterableチェック
                if(!util.isArray(values)){
                    return;
                }
                length = values.length;
                for(; i < length; i++){
                    Promise.resolve(values[i]).then(((index) => {
                        return (result) => {
                            if(completed){
                                return;
                            }
                            results[index] = result;
                            resolvedLength += 1;
                            if(length <= resolvedLength){
                                completed = true;
                                onFulfilled(results);
                            }
                        }
                    })(i), (result) => {
                        if(completed){
                            return;
                        }
                        completed = true;
                        onRejected(result);
                    });
                }
            });
        }

        public static race(values: any[]): Promise {
            return new Promise((onFulfilled, onRejected) => {
                var i = 0, length, completed = false;
                //TODO: iterableチェック
                if(!util.isArray(values)){
                    return;
                }
                length = values.length;
                for(; i < length; i++){
                    Promise.resolve(values[i]).then((value) => {
                        if(completed) return;
                        completed = true;
                        onFulfilled(value);
                    }, (value) => {
                        if(completed) return;
                        completed = true;
                        onRejected(value);
                    });
                }
            });
        }
    }
}

export = Typy;
