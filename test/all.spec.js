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


    describe(prefix + "all test", function () {

        this.timeout(3000);

        it(prefix + "全部成功するプロミス", function(done){

            var promises = [];
            promises.push(asyncResolve("a", 1000));
            promises.push(asyncResolve("b", 500));
            promises.push(asyncResolve("c", 100));

            Promise.all(promises).then(function(results){

                expect(results[0]).to.be("a");
                expect(results[1]).to.be("b");
                expect(results[2]).to.be("c");
                done();
            });
        });

        it(prefix + "失敗した時点で後ろは評価されない", function(done){
            var promises = [],
                rejected = false;
            promises.push(new Promise(function(resolve, reject){
                setTimeout(function(){
                    expect(rejected).to.be(true);
                    done();
                }, 1000);
            }));
            promises.push(asyncReject("b", 500));
            promises.push(asyncResolve("c", 100));

            Promise.all(promises).then(function(results){
                throw new Error("error");
            }, function(result){
                expect(result).to.be("b");
                rejected = true;
            });
        });

        it(prefix + "即値でも成功", function(done){
            var promises = ["a", "b"];

            Promise.all(promises).then(function(results){
                expect(results[0]).to.be("a");
                expect(results[1]).to.be("b");
                done();
            });
        });

        it(prefix + "関数は関数が返る", function(done){

            var func = function(){
                    return "c"
                },
                promises = ["a", "b", func];
            Promise.all(promises).then(function(results){
                expect(results[0]).to.be("a");
                expect(results[1]).to.be("b");
                expect(results[2]).to.be(func);
                done();
            });
        });

        it(prefix + "thenableはthenableで扱われる", function(done){
            var thenable1 = createThenable(),
                thenable2 = createThenable(),
                thenable3 = createThenable();

            Promise.all([thenable1, thenable2, thenable3]).then(function(results){
                expect(results[0]).to.be("a");
                expect(results[1]).to.be("b");
                expect(results[2]).to.be("c");

                done();
            });
            setTimeout(function(){
                thenable1.res("a");
                thenable2.res("b");
                thenable3.res("c");
            }, 10);

        });

        it(prefix + "配列ではなく単一の値", function(done){
            Promise.all(asyncResolve("a", 100)).then(function(results){
                //error
                expect(true).to.be(false);
            }, function(err){
                expect(err instanceof TypeError).to.be(true);
                // expect(true).to.be(true);
                done();
            });
        });

        it(prefix + "単一のオブジェクト", function(done){

            Promise.all({
                "A": asyncResolve("a", 100),
                "B": asyncResolve("b", 200)
            }).then(function(results){
                //error
                expect(true).to.be(false);
            }, function(err){
                expect(err instanceof TypeError).to.be(true);
                // expect(true).to.be(true);
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
        //         expect(true).to.be(false);
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

if(!glob.expect && typeof require !== "undefined"){
   glob.expect = require("expect.js");
}

if(glob.Promise){
    exec(Promise, "Native:");
}

if(typeof require !== "undefined"){

    exec(require("../bin/node/promise.js").Promise);
}else{
    exec(Typy.Promise);
}
