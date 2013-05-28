var
util	= require('util'),
EE	= require('events').EventEmitter,
Winston = require('winston');

var logger;

function User(socket)
{
	EE.call(this);
	/**
	 * Class variables
	 */
	this.id = socket.id;
	this.channel = socket;

	/**
	 * Local variables
	 */
	var
	mirror = this;

	/**
	 * Local methods
	 */
	 
	/**
	 * Events
	 */
}

util.inherits(User, EE);

/**
 * Class methods
 */
User.prototype.inbox = function(msg){};
User.prototype.outbox = function(cmd, args){};

module.exports = function(verbose)
{
	logger = new Winston.Logger({transports: (verbose) ? [new Winston.transports.Console()] : []});
	return User;
};
