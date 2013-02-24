/*
var o = { 
    foo:"bar",
    arr:[1,2,3],
    subo: {
        foo2:"bar2"
    }
};
*/

//called with every property and its value
function process(key,value) {
    console.log(key + " : " + value);
}

function traverse(o,func) {
    for (i in o) {
        func.apply(this,[i,o[i]]);  
        if (typeof(o[i]) == "object") {
            //going one step down in the object tree!!
            traverse(o[i],func);
        }
    }
}

//that's all... no magic, no bloated framework
