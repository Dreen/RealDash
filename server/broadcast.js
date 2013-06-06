var
util	= require('util'),
async	= require('async'),
io	= require('socket.io'),
EE	= require('events').EventEmitter,
Winston = require('winston');

var logger;

function Broadcast(db, getUserList)
{
	EE.call(this);
	this.running = false;
	
	var
	mirror = this,
	jobs_req = db.collection('jobs_req');
	
	// main loop
	this.on('tick', function(i)
	{
		var users = getUserList();
		// loop through all clients
		async.each(users, function(user, done)
		{
			// if client accepts broadcasting
			if (user.broadcast)
			{
				for (callName in user.model)
				{
					// get the jobs completed after the last job the user has seen
					var call = user.model[callName];
					jobs_req.find({'start': {$gt: call.last}}).toArray(function(err, newJobs)
					{
						for(var j=0; j<newJobs.length; j++)
						{
							if (newJobs[j].start > user.model[newJobs[j].sig].last)
							{
								user.outbox('jobinfo', [newJobs[j]]); // TODO what do we want to send here
								console.log('Last for %s was %d now %d', newJobs[j].sig, user.model[newJobs[j].sig].last, newJobs[j].start);
								user.model[newJobs[j].sig].last = newJobs[j].start;
							}
						}
					});
				}
			}
		});
	
		if (mirror.running)
		{
			setTimeout(function(){
				mirror.emit('tick', ++i);
			}, 100);
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
