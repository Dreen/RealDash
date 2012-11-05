Function.prototype.child = function(proto) {
    function Class() {
        if (!(this instanceof Class)) throw ('Constructor called without "new"');
        if ('SETID' in this) this.SETID.apply(this, arguments);
        if ('__init__' in this) this.__init__.apply(this, arguments);
    }
    Function.prototype.child.nonconstructor.prototype = jQuery.extend({}, this.prototype, proto);
    Class.prototype = new Function.prototype.child.nonconstructor();
    return Class;
};
Function.prototype.child.nonconstructor = function() {};