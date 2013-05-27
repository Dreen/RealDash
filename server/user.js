var
util	= require('util'),
EE	= require('events').EventEmitter,
Winston = require('winston');

var logger;

function User(socket)
{
	EE.call(this);
	this.id = socket.id;

	var
	mirror = this;
}

util.inherits(User, EE);

module.exports = function(verbose)
{
	logger = new Winston.Logger({transports: (verbose) ? [new Winston.transports.Console()] : []});
	return User;
};
