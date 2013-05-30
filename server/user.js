var
util	= require('util'),
f 	= require('util').format,
EE	= require('events').EventEmitter,
Winston = require('winston'),

Msg	= require('./msg.js');

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
	this.ip = socket.handshake.address.address;
	this.broadcast = true;
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
				logger.info(f('User: Loaded model: %d calls', mirror.model.length));
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
	this.on('error', function(msg)
	{
		logger.error('User: ' + msg);
	})

	startinit();
}

util.inherits(User, EE);

/**
 * Class methods
 */
User.prototype.inbox = function(msgData)
{
	var msg = new Msg(msgData);
	this.emit('recv', msg);

	if (!msg.isValid)
	{
		this.outbox('serverError', ['Invalid client message']);
		this.emit('error', 'Invalid client message: ' + msg.toString());
	}
};

User.prototype.outbox = function(cmd, args)
{
	var msg = new Msg({
		'cid':	this.id,
		'cmd':	cmd,
		'args':	args
	});

	if (msg.isValid)
	{
		this.emit('send', msg);
	}
	else
	{
		this.emit('error', 'Invalid server message');
	}
};

module.exports = function(verbose)
{
	logger = new Winston.Logger({transports: (verbose) ? [new Winston.transports.Console()] : []});
	return User;
};
