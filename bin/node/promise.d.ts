declare module Typy {
    interface DoneAction {
        (args: any): void;
    }
    class Promise {
        private _inners;
        private _state;
        private _result;
        constructor(resolver: (onFulfillment?: DoneAction, onRejection?: DoneAction) => void);
        then(onFulfilled: DoneAction, onRejected?: DoneAction): Promise;
        "catch"(onRejected: DoneAction): Promise;
        static resolve(value: any): Promise;
        static reject(value: any): Promise;
        static all(values: any[]): Promise;
    }
}
export = Typy;
