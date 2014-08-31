function exec(Promise, prefix) {

    prefix = prefix || "";

    describe(prefix + "Promise base test", function () {

        it(prefix + "チェーンのテスト", function (done) {
            (new Promise(function (resolve, reject) {
                resolve("AAA");
            })).then(function (result) {
                    expect(result).toEqual("AAA");
                    return "BBB";
                }).then(function (result) {
                    expect(result).toEqual("BBB");
                    done();
                });
        });

        it(prefix + "Rejectのテスト", function (done) {
            (new Promise(function (resolve, reject) {
                reject(new Error("AAA"));
            })).then(function (result) {
                    fail();
                }, function (result) {
                    expect(result.message).toEqual("AAA");
                    return "BBB"
                }).then(function (result) {
                    expect(result).toEqual("BBB");
                    done();
                });
        });

        it(prefix + "Catchのテスト", function (done) {
            (new Promise(function (resolve, reject) {
                reject(new Error("AAA"));
            })).catch(function (result) {
                    expect(result.message).toEqual("AAA");
                    return "BBB"
                }).then(function (result) {
                    expect(result).toEqual("BBB");
                    done();
                });
        });

        it(prefix + "Resolveに引数を複数渡しても先頭しか評価されない", function(done){
            (new Promise(function (resolve, reject) {
                //PhantomJSのbindがshimなため失敗する
                //expect(resolve.length).toEqual(1);

                resolve("AAA", "bbb");
            })).then(function (result, result2) {
                    expect(result).toEqual("AAA");
                    expect(result2).toBeUndefined();
                    return "BBB";
                }).then(function (result) {
                    expect(result).toEqual("BBB");
                    done();
                });
        });

        it(prefix + "(then)Rejectに引数を複数渡しても先頭しか評価されない", function(done){
            (new Promise(function (resolve, reject) {
                //PhantomJSのbindがshimなため失敗する
                //expect(reject.length).toEqual(1);
                reject(new Error("AAA"), new Error("BBB"));
            })).then(function (result) {
                    fail();
                }, function (result, result2) {
                    expect(result.message).toEqual("AAA");
                    expect(result2).toBeUndefined();
                    done();
                });
        });

        it(prefix + "(catch)Rejectに引数を複数渡しても先頭しか評価されない", function(done){
            (new Promise(function (resolve, reject) {
                //PhantomJSのbindがshimなため失敗する
                //expect(reject.length).toEqual(1);
                reject(new Error("AAA"), new Error("BBB"));
            })).catch(function (result, result2) {
                    expect(result.message).toEqual("AAA");
                    expect(result2).toBeUndefined();
                    done();
                });
        });

        it(prefix + "constructor の 実行コンテキスト", function(done){
            (new Promise(function (resolve, reject) {
                expect(this).toEqual(window || global);
                done();
            }));
        });

        it(prefix + "then resolve の 実行コンテキスト", function(done){
            (new Promise(function (resolve, reject) {
                resolve("aaa");
            }).then(function(result){
                    expect(this).toEqual(window || global);
                    done();
                }));
        });

        it(prefix + "then reject の 実行コンテキスト", function(done){
            (new Promise(function (resolve, reject) {
                reject("aaa");
            }).then(null, function(result){
                    expect(this).toEqual(window || global);
                    done();
                }));
        });

        it(prefix + "catch の 実行コンテキスト", function(done){
            (new Promise(function (resolve, reject) {
                reject("aaa");
            }).catch(function(result){
                    expect(this).toEqual(window || global);
                    done();
                }));
        });

        it(prefix + "then の内容は非同期で実行される", function(done){
            var result = "AAA";
            (new Promise(function(resolve, reject){
                result = "BBB";
                resolve();
            }).then(function(r){
                    expect(result).toEqual("CCC");
                    done();
                }));;

            expect(result).toEqual("BBB");
            result = "CCC";
        });

        //Firefoxはthenのチェインのほうが先に走る
//        it(prefix + "複数のthenは設定された順番に子供より先に呼ばれる", function(done){
//
//            var result = "AAA";
//
//            var p = new Promise(function(resolve){
//                resolve("BBB");
//            });
////
//            p.then(function(r){
//                expect(result).toEqual("AAA");
//                result = "BBB";
//            }).then(function(){
//                expect(result).toEqual("ZZZ");
//                result = "CCC";
//            }).then(function(){
//                expect(result).toEqual("CCC");
//                //result = "DDD";
//                done();
//            });
////
//            p.then(function(r){
//                expect(result).toEqual("BBB");
//                result = "ZZZ";
//
//            });
//        });

        it(prefix + "エラーの場合は子孫のキャッチがあれば利用される", function(done){
            (new Promise(function(resolve, reject){
                reject(new Error("AAA"));
            })).then(function(result){
                    fail();
                }).then(function(result){
//                    expect(result.message).toEqual("AAA");
//                    done();
                }).then(undefined, function(result){
                    expect(result.message).toEqual("AAA");
                    done();
                });
        });

        it(prefix + "コンストラクターで例外が発生した場合はrejectになる", function(done){

            (new Promise(function(){
                throw new Error("AAA");
            })).catch(function(err){
                expect(err.message).toEqual("AAA");
                done();
            });

        });

        it(prefix + "fulfillのハンドラの中で例外がおこった場合は、rejectになる", function(done){

            (new Promise(function(resolve){
                resolve("AAA");
            })).then(function(result){
                expect(result).toEqual("AAA");
                throw new Error("BBB");
            }).catch(function(err){
                expect(err.message).toEqual("BBB");
                done();
            });
        });
    });
}

if((window || global).Promise){
    exec(Promise, "Native:");
}
exec(Typy.Promise);