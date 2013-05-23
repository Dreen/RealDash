var
io	= require('socket.io'),
util	= require('util'),
EE	= require('events').EventEmitter,
Winston = require('winston');

var logger;

function Broadcast(db)
{
	EE.call(this);
	this.running = false;
	
	var
	mirror = this;
	
	// main loop
	this.on('tick', function(i)
	{
		if (mirror.running)
		{
			setTimeout(function(){
				mirror.emit('tick', ++i);
			}, 1000);
		}
		else
		{
			mirror.emit('shutdown_complete');
		}
	});
}

util.inherits(Bot, EE);

Broadcast.prototype.shutdown = function()
{
	logger.info('Bot: Shutting down');
	this.running = false;
};

Broadcast.prototype.start = function()
{
	logger.info('starting');
	this.running = true;
	this.emit('tick', 1);
};

module.exports = function(verbose)
{
	logger = new Winston.Logger({transports: (verbose) ? [new Winston.transports.Console()] : []});
	return Broadcast;
};
