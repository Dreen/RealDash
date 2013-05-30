var
util	= require('util'),
async	= require('async'),
EE	= require('events').EventEmitter,
Winston = require('winston');

var logger;

function Broadcast(db)
{
	EE.call(this);
	this.running = false;
	
	var
	mirror = this,
	jobs_req = db.collection('jobs_req');
	
	// main loop
	this.on('tick', function(i)
	{
		logger.warn('bcast tick');
		debugger;
		// loop through all clients
		async.each(global.users.pool, function(user, done)
		{
			logger.warn(user.id);
			// if client accepts broadcasting
			if (user.broadcast)
			{
				for (var i=0; i<user.model.length; i++)
				{
					// get the jobs completed after the last job the user has seen
					var call = user.model[i];
					logger.warn(call);
					jobs_req.find({'start': {$gt: call.last}}).toArray(function(err, newJobs)
					{
						for(var j=0; j<newJobs.length; j++)
						{
							logger.warn(newJobs[j]);
							user.outbox('jobinfo', [newJobs[j]]); // TODO what do we want to send here
						}
					});
				}
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
