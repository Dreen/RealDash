var
util	= require('util'),
fs	= require('fs'),
EE	= require('events').EventEmitter,
Winston = require('winston'),

Request	= require('./request.js')(true);

var logger;

function Bot(db)
{
	EE.call(this);
	this.db = db;
	this.requestModel = {};
	this.apis = {};
	this.jobs = {};

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
			for (var q=0; q<data[i]['calls'].length; q++)
			{
				mirror.jobs[data[i]['calls'][q]['sig']] = null;
			}
		}
		logger.info('API Objects: ' + data.length);
		logger.info('Calls: ' + Object.keys(mirror.jobs).length);
		mirror.emit('loaded_model');
	});


	// load objects
	this.on('loaded_model', function()
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

	

	// main loop revisited
	this.on('loaded_objects', function()
	{
		logger.info('Starting');
		while (mirror.isRunning())
		{
			for (apiName in mirror.requestModel)
			{
				// loop through calls and make new requests for the ones that dont have active jobs AND should be called accoring to their timers
				for (var i=0; i<mirror.requestModel[apiName].calls.length; i++)
				{
					var call = mirror.requestModel[apiName].calls[i];
					var oldReq = mirror.jobs[call['sig']];

					// if there are no finished jobs, or the last job finished less than the appropiate time before now
					if (oldReq === null || (oldReq.finished === true && (new Date().getTime() - call['timer']*1000 > oldReq.tStart)))
					{
						mirror.jobs[call['sig']] = false;
						logger.info('calling ' + call['sig']);

						var req = new Request(mirror.apis[apiName], call);
						req.on('finished', function(result)
						{
							logger.info('finished ' + call['sig'] + ' in ' + req.ran());
							mirror.emit('resulted', req);
						});

						req.run();
						mirror.jobs[call['sig']] = req;
						mirror.emit('called', req);
					}
				}
			}
			mirror.running = false;
		}
		logger.info('Shutting down');
		mirror.emit('shutdown_complete');
	});

	// main loop
	var tick = function()
	{
		for (apiName in mirror.requestModel)
		{
			// loop through calls and make new requests for the ones that dont have active jobs AND should be called accoring to their timers
			for (var i=0; i<mirror.requestModel[apiName].calls.length; i++)
			{
				var call = mirror.requestModel[apiName].calls[i];
				jobs_req.find({'sig': call['sig'], 'finished': false}).toArray(function(err, docs)
				{
					// if there are no unfinished (active) jobs for this call
					if (docs.length == 0)
					{
						// get the last finished job
						jobs_req.find({'sig': call['sig'], 'finished': true}).sort('end', 'desc').limit(1).toArray(function(err, last)
						{
							// if there are no finished job either, or the last job finished less than the appropiate time before now
							if (last.length == 0 || (new Date().getTime() - call['timer']*1000 > last[0]['start']))
							{
								// start a new job
								mirror.activeJobs.push(call['sig']);
								//var req = new Request(mirror.apis[apiName], call),
								//item_id = null;
								//req.on('finished', function(result)
								//{
								//	mirror.result = result;
								//	jobs_req.update({_id: item_id}, {$set: {
								//		'finished' : true,
								//		'end': req.tFinish,
								//		'exectime': req.ran(),
								//		'result': result
								//	}}, function()
								//	{
								//		mirror.emit('resulted', req);
								//	});
								//});

								//var tStart = new Date().getTime();
								//jobs_req.insert({
								//	'call' : call['sig'],
								//	'finished' : false,
								//	'start': tStart,
								//	'end': -1,
								//	'exectime': 0,
								//	'result': null
								//}, function(err, item)
								//{
								//	console.log(item);
								//	item_id = item._id;
								//	req.run(tStart);
								//	mirror.emit('called', req);
								//});
							}
						});
					}
				});
			}
		}

		//console.log(mirror.running);

		if (mirror.running)
		{
			//tick();
		}
		else
		{
			mirror.emit('shutdown_complete');
		}
	};

	//// start main loop
	//mirror.on('loaded_objects', function()
	//{
	//	mirror.running = true;
	//	tick();
	//});
}

util.inherits(Bot, EE);

Bot.prototype.shutdown = function()
{
	this.running = false;
};

Bot.prototype.start = function()
{
	this.running = true;
};

Bot.prototype.isRunning = function()
{
	return this.running;
};

module.exports = function(verbose)
{
	logger = new Winston.Logger({transports: (verbose) ? [new Winston.transports.Console()] : []});
	return Bot;
};
