var
util	= require('util'),
f 	= util.format,
EE	= require('events').EventEmitter,
Winston = require('winston');

var logger;

function Request(CallObj, callSpec)
{
	EE.call(this);
	this.callObj = CallObj;
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
	this.tStart = tStart || new Date().getTime();

	// get the worker
	var worker = this.callObj[this.spec['method']].apply(this.callObj, this.spec['args']);

	// run worker
	var mirror = this;
	worker(function(result)
	{
		mirror.tFinish = new Date().getTime();
		mirror.finished = true;
		mirror.result = result;
		logger.info(f('%s: Finished', mirror.toString()));
		mirror.emit('finished', result);
	});

	logger.info(f('%s: Called', this.toString()));
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
