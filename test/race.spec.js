function exec(Promise, prefix) {

    prefix = prefix || "";

    if(!Promise.all){
        return;
    }

    function asyncResolve(value, timeout){
        return new Promise(function(resolve, reject){
            setTimeout(function(){
                resolve(value);
            }, timeout);
        });
    }

    function asyncReject(value, timeout){
        return new Promise(function(resolve, reject){
            setTimeout(function(){
                reject(value);
            }, timeout);
        });
    }

    function createThenable(){
        var res, rej;
        return {
            hasRes: function(){
                return !!res;
            },
            hasRej: function(){
                return !!rej;
            },
            res: function(value){
                if(res) res(value);
            },
            rej: function(value){
                if(rej) rej(value);
            },
            then: function(resolve, reject){
                res = resolve;
                rej = reject;
            }
        };
    }


    describe(prefix + "race test", function () {

        it(prefix + "全部成功するプロミス", function(done){

            var promises = [];
            promises.push(asyncResolve("a", 1000));
            promises.push(asyncResolve("b", 500));
            promises.push(asyncResolve("c", 100));

            Promise.race(promises).then(function(result){
                expect(result).toBe("c");
            });
            setTimeout(function(){
                done();
            }, 1100);
        });

        it(prefix + "失敗した時点で後ろは評価されない", function(done){
            var promises = [];
            promises.push(asyncReject("b", 500));
            promises.push(asyncResolve("c", 600));

            Promise.race(promises).then(function(results){
                expect(true).toBe(false);
            }, function(result){
                expect(result).toBe("b");
            });
            setTimeout(function(){
                done();
            }, 1000);
        });

        it(prefix + "即値でも成功", function(done){
            var promises = ["a", "b"];
            Promise.race(promises).then(function(result){
                expect(result).toBe("a");
                done();
            });
        });

        it(prefix + "関数は関数が返る", function(done){

            var func = function(){
                    return "c"
                },
                promises = [func, "a", "b"];
            Promise.race(promises).then(function(result){
                expect(result).toBe(func);
                done();
            });
        });

        it(prefix + "thenableはthenableで扱われる", function(done){
            var thenable1 = createThenable(),
                thenable2 = createThenable(),
                thenable3 = createThenable();

            Promise.race([thenable1, thenable2, thenable3]).then(function(result){
                expect(result).toBe("b");
                done();
            });
            setTimeout(function(){
                thenable2.res("b");
            }, 10);

        });

        it(prefix + "配列ではなく単一の値", function(done){
            Promise.race(asyncResolve("a", 100)).then(function(results){
                //error
                expect(true).toBe(false);
            }, function(err){
                expect(err instanceof TypeError).toBe(true);
                // expect(true).toBe(true);
                done();
            });
        });

        it(prefix + "単一のオブジェクト", function(done){

            Promise.race({
                "A": asyncResolve("a", 100),
                "B": asyncResolve("b", 200)
            }).then(function(results){
                //error
                expect(true).toBe(false);
            }, function(err){
                expect(err instanceof TypeError).toBe(true);
                // expect(true).toBe(true);
                done();
            });
        });
        // it(prefix + "Map", function(done){
        //     if(typeof Map === "undefined"){
        //         return;
        //     }
        //     var promises = new Map();
        //     promises.set("A", asyncResolve("a", 100));
        //     promises.set("B", asyncResolve("b", 200));
        //     Promise.all(promises).then(function(results){
        //         //error
        //         expect(true).toBe(false);
        //     });
        //     setTimeout(function(){
        //         done();
        //     }, 250);
        //
        // });
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
