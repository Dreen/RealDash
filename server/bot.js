var
util	= require('util'),
fs	= require('fs'),
EE	= require('events').EventEmitter;

function Bot(db)
{
	EE.call(this);
	this.db = db;
	this.requestModel = {};
	this.apis = {};
	this.activeJobs = [];

	var
	model = this.db.collection('model'),
	jobs_req = this.db.collection('jobs_req'),
	mirror = this;

	// load model
	model.find().toArray(function(err, data)
	{
		for(var i=0; i<data.length; i++)
		{
			mirror.requestModel[data[i].name] = data[i];
		}
		mirror.emit('loaded_model');
	});

	// load objects
	mirror.on('loaded_model', function()
	{
		for (apiName in mirror.requestModel)
		{
			var modulePath = './api/' + mirror.requestModel[apiName]['file'];
			if (fs.existsSync(modulePath))
			{
				mirror.apis[apiName] = require(modulePath);	
			}
		}
		mirror.emit('loaded_objects');
	});

	// main loop
	mirror.on('loaded_objects', function()
	{
		mirror.running = true;
		while(mirror.running)
		{
			for (apiName in mirror.requestModel)
			{
				// loop through calls and make new requests for the ones that dont have active jobs AND should be called accoring to their timers
				for (var i=0; i<mirror.requestModel[apiName].calls.length; i++)
				{
					var call = mirror.requestModel[apiName].calls[i];
					jobs_req.find({'sig': call['sig'], 'finished': false}).count(function(err, count)
					{
						// TODO error handling and logging in this module
						// if there are no unfinished (active) jobs for this call
						if (count == 0)
						{
							// get the last finished job
							jobs_req.find({'sig': call['sig'], 'finished': true}).sort('end', 'desc').limit(1).toArray(function(err, last)
							{
								// if there are no finished job either, or the last job finished less than the appropiate time before now
								if (last.length == 0 || (new Data.getTime() - call['timer'] > last[0]['start']))
								{
									// start a new job
									console.log('start ' + call['sig']);
								}
							});
						}
					});
				}
			}
			mirror.running = false;
		}
		mirror.emit('shutdown_complete');
	});
}

util.inherits(Bot, EE);

Bot.prototype.shutdown = function()
{
	this.running = false;
};

module.exports = Bot;
