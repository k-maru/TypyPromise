var Typy = require("../bin/node/promise.js");
if(window.Typy){
    window.Typy.Promise = Typy.Promise;
}else{
    window.Typy = Typy;
}
