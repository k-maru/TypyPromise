function exec(Promise, prefix) {

    // prefix = prefix || "";
    //
    // describe(prefix + "Global catch test", function () {
    //
    //     beforeEach(function(){
    //         if(Promise.globalCatch){
    //             Promise.globalCatch(undefined);
    //         }
    //     });
    //
    //     afterEach(function(){
    //         if(Promise.globalCatch){
    //             Promise.globalCatch(undefined);
    //         }
    //     })
    //
    //
    //     it(prefix + "catchがないときはGlobalCatchが実行される", function (done) {
    //
    //         Promise.globalCatch(function(result){
    //             expect(result.value).toEqual("AAA");
    //             done();
    //         });
    //
    //         (new Promise(function (resolve, reject) {
    //             reject("AAA");
    //         })).then(function (result) {
    //             expect(result).toEqual("AAA");
    //             return "BBB";
    //         }).then(function (result) {
    //             expect(result).toEqual("BBB");
    //         });
    //     });
    // });
}

//if(require){
//    exec(require("../bin/node/promise.js").Promise);
//}else{
//    exec(Typy.Promise);
//}
