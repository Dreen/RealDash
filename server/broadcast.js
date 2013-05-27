var
util	= require('util'),
async	= require('async'),
EE	= require('events').EventEmitter,
Winston = require('winston');

var logger;

function Broadcast(db, users)
{
	EE.call(this);
	this.running = false;
	this.users = users;
	
	var
	mirror = this,
	jobs_req = db.collection('jobs_req');
	
	// main loop
	this.on('tick', function(i)
	{
		// loop through all clients
		async.each(mirror.users, function(user, done)
		{
			// if client accepts broadcasting
			if (user.model.broadcast)
			{
				// send him a msg?
			}
		});
	
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

util.inherits(Broadcast, EE);

Broadcast.prototype.shutdown = function()
{
	logger.info('Broadcast: Shutting down');
	this.running = false;
};

Broadcast.prototype.start = function()
{
	logger.info('Broadcast: Starting');
	this.running = true;
	this.emit('tick', 1);
};

module.exports = function(verbose)
{
	logger = new Winston.Logger({transports: (verbose) ? [new Winston.transports.Console()] : []});
	return Broadcast;
};
