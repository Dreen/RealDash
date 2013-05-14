var
util	= require('util'),
EE	= require('events').EventEmitter;

function Request(CallClass, callSpec)
{
	EE.call(this);
	this.api = CallClass;
	this.spec = callSpec;

	// TODO: error handling and logging in this mondule
}

util.inherits(Request, EE);

Request.prototype.toString = function()
{
	return this.spec['sig'];
};

Request.prototype.run = function(tStart)
{
	var mirror = this;
	this.tStart = tStart || new Date().getTime();

	var callObj = new this.api(function(result)
	{
		mirror.tFinish = new Date().getTime();
		mirror.emit('finished', result);
	});

	callObj[this.spec['method']].apply(callObj, this.spec['args']);
};

Request.prototype.ran = function()
{
	return this.tFinish - this.tStart;
}

module.exports = Request;
