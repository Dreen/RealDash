var _values		= require('underscore').values,
	_without	= require('underscore').without;

exports.def = function(variable, defaultValue)
{
    return (typeof variable === "undefined") ? defaultValue : variable;
}

exports.concrete = function(arr)
{
	return (_without(_values(arr), undefined).length > 0);
}

/* TODO class function or maybe sugar?
exports.class = function(contructor, parent, childproto)
{
	var child = function() {
		child.super_.call(this);
		constructor.call(this);
	}
	
	util.inherits(child, parent);
	
	for (e in childproto)
	{
		child.prototype[e] = childproto[e];
	}
}
*/

/* 
* http://onemoredigit.com/post/1527191998/extending-objects-in-node-js
*/
// Object.defineProperty(Object.prototype, "extend", {
    // enumerable: false,
    // value: function(from) {
        // var props = Object.getOwnPropertyNames(from);
        // var dest = this;
        // props.forEach(function(name) {
            // if (name in dest) {
                // var destination = Object.getOwnPropertyDescriptor(from, name);
                // Object.defineProperty(dest, name, destination);
            // }
        // });
        // return this;
    // }
// });