declare function setImmediate(callback: Function): void;
declare function setTimeout(callback: Function, timeout: number): number;
declare var global: any;
declare var window: any;

export function bind(target: Function, context: any, ...args: any[]){
    if(Function.prototype.bind){
        args.unshift(context);
        return Function.prototype.bind.apply(target, args);
    }

    return function(...relArgs: any[]) {
        var a = args.concat(relArgs);
        return target.apply(context, a);
    }
}

export function async(callback: Function, context: any, ...args: any[]): void{

    var glob = typeof window !== "undefined" ? window :
               typeof global !== "undefined" ? global :
               {};

    if(glob.setImmediate){
        glob.setImmediate(() => {
            callback.apply(context, args);
        });
    }else{
        setTimeout(() => {
            callback.apply(context, args);
        }, 0);
    }
}

export function isThenable(value: any): boolean{
    if(!value){
        return false;
    }
    return Object.prototype.toString.call(value.then) === "[object Function]";
}

export function isArray(value: any): boolean{
    if(!value){
        return false;
    }
    return Object.prototype.toString.call(value) === "[object Array]";
}

export function isIterable(value: any): boolean{
    //TODO: @@iterable の判定。しばらくは Array のみ
    return isArray(value);
}
