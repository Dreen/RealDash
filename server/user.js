var
util	= require('util'),
EE	= require('events').EventEmitter,
Winston = require('winston');

var logger;

function User(db, socket)
{
	EE.call(this);
	/**
	 * Class variables
	 */
	this._db = db;
	this._channel = socket;
	this.id = socket.id;
	this.ip = ""; // TODO
	this.model = [];

	/**
	 * Local variables
	 */
	var
	mirror = this,
	clients = this._db.collection('clients');

	/**
	 * Local methods
	 */
	function startinit()
	{
		// load model
		clients.find({'uid': mirror.id}).toArray(function(err, data)
		{
			if (data.length === 1)
			{
				mirror.model = data[0].model;
				mirror.emit('loaded_model');
			}
			else
			{
				mirror.emit('error', 'Model not loaded.');
			}
		});
	}

	/**
	 * Events
	 */


	startinit();
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
