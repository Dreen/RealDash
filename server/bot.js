var
util	= require('util'),
EE	= require('events').EventEmitter;

function Bot(db, verboseRequests)
{
	EE.call(this);
	this.db = db;
	this.verboseRequests = verboseRequests || false;
}

util.inherits(Bot, EE);

module.exports = Bot;
