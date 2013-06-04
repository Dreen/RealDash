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
	this.model = {};

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
				logger.info(f('User: Loaded model: %d calls', Object.keys(mirror.model).length));
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
	var msgObj = new Msg(msgData);
	this.emit('recv', msgObj);

	if (!msgObj.isValid)
	{
		this.outbox('serverError', ['Invalid client message']);
		this.emit('error', 'Invalid client message: ' + msgObj.toString());
	}
	else
	{
		logger.info('User: In: ' + msgObj.toString());
		// TODO: process message
	}
};

User.prototype.outbox = function(cmd, args)
{
	var msgObj = new Msg({
		'cid':	this.id,
		'cmd':	cmd,
		'args':	args
	});

	if (msgObj.isValid)
	{
		this.emit('send', msgObj);
		logger.info('User: Out: ' + msgObj.toString());
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
