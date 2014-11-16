function exec(Promise, prefix) {

    prefix = prefix || "";

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

    describe(prefix + "Promise resolve thenable test", function () {

        it(prefix + "thenableでresolve", function(done){

            var then = createThenable();

            Promise.resolve(then).then(function(value){
                expect(value).toBe("AAA");
                done();
            }, function(){
                throw "error";
            });
            expect(then.hasRes()).toBe(false);
            expect(then.hasRej()).toBe(false);
            setTimeout(function(){
                expect(then.hasRes()).toBe(true);
                expect(then.hasRej()).toBe(true);
                then.res("AAA");
            },0);
        });

        it(prefix + "thenableでreject", function(done){

            var then = createThenable();

            Promise.resolve(then).then(function(value){
                throw "error";
            }, function(value){
                expect(value).toBe("AAA");
                done();
            });
            expect(then.hasRes()).toBe(false);
            expect(then.hasRej()).toBe(false);
            setTimeout(function(){
                expect(then.hasRes()).toBe(true);
                expect(then.hasRej()).toBe(true);
                then.rej("AAA");
            },0);
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
