var
util	= require('util'),
EE	= require('events').EventEmitter,
Winston = require('winston');

var logger;

function Request(CallClass, callSpec)
{
	EE.call(this);
	this.api = CallClass;
	this.spec = callSpec;
	this.finished = false;
	this.result = null;
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
		mirror.finished = true;
		mirror.result = result;
		logger.info('<- ' + mirror.toString());
		mirror.emit('finished', result);
	});

	logger.info('-> ' + this.toString());

	callObj[this.spec['method']].apply(callObj, this.spec['args']);
};

Request.prototype.ran = function()
{
	return this.tFinish - this.tStart;
}

module.exports = function(verbose)
{
	logger = new Winston.Logger({transports: (verbose) ? [new Winston.transports.Console()] : []});
	return Request;
};
