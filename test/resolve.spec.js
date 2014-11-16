function exec(Promise, prefix) {

    prefix = prefix || "";

    describe(prefix + "Promise resolve test", function () {

        it(prefix + "即値のテスト", function (done) {
            Promise.resolve("aaa").then(function(result){
                expect(result).toEqual("aaa");
                done();
            });
        });

        it(prefix + "結果にPromise", function(done){

            Promise.resolve(new Promise(function(onfulfilled){
                onfulfilled("aaa");
            })).then(function(result){
                expect(result).toEqual("aaa");
                done();
            });
        });

        it(prefix + "結果にReject Promise", function(done){
            Promise.resolve(new Promise(function(onfulfilled, onrejected){
                onrejected("aaa");
            }))["catch"](function(result){
                expect(result).toEqual("aaa");
                done();
            });
        });
    });

    describe(prefix + "Promise reject test", function () {

        it(prefix + "即値のテスト", function (done) {
            Promise.reject("aaa").then(undefined, function(result){
                expect(result).toEqual("aaa");
                done();
            });
        });

        it(prefix + "結果にPromise", function(done){
            var p = new Promise(function(onfulfilled, onrejected){
                onrejected("aaa");
            });
            Promise.reject(p).then(undefined, function(result){
                expect(result).toEqual(p);
                done();
            });
        });

        it(prefix + "結果にResolve Promise", function(done){
            var p = new Promise(function(onfulfilled, onrejected){
                onfulfilled("aaa");
            });
            Promise.reject(p).then(undefined, function(result){
                expect(result).toEqual(p);
                done();
            });
        });
    });

}

var glob = typeof window !== "undefined" ? window :
           typeof global !== "undefined" ? global : {};

if(glob.Promise){
    exec(Promise, "Native:");
}

if(typeof require !== "undefined"){
    exec(require("../bin/node/promise.js").Promise);
}else{
    exec(Typy.Promise);
}
