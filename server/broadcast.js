var
util	= require('util'),
async	= require('async'),
EE	= require('events').EventEmitter,
Winston = require('winston');

var logger;

function Broadcast(db, users)
{
	EE.call(this);
	this._users = users;
	this.running = false;
	
	var
	mirror = this,
	jobs_req = db.collection('jobs_req');
	
	// main loop
	this.on('tick', function(i)
	{
		// loop through all clients
		async.each(mirror._users, function(user, done)
		{
			// if client accepts broadcasting
			if (user.broadcast)
			{
				for (var i=0; i<user.model.length; i++)
				{
					// get the jobs completed after the last job the user has seen
					var call = user.model[i];
					jobs_req.find({'start': {$gt: call.last}}).toArray(function(err, newJobs)
					{
						for(var j=0; j<newJobs.length; j++)
						{
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
