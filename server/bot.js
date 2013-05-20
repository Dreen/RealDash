var
util	= require('util'),
f 	= util.format,
fs	= require('fs'),
EE	= require('events').EventEmitter,
async	= require('async'),
Winston = require('winston'),
MDBOID	= require('mongodb').ObjectID,

Request	= require('./request.js')();

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
		logger.info(f('Bot: API Objects: %d', data.length));
		logger.info(f('Bot: Calls: %d', Object.keys(mirror.jobs).length));
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
				var APIObj = require(modulePath);
				mirror.apis[apiName] = new APIObj();	
			}
		}
		mirror.emit('loaded_objects');
	});

	// remove unfinished entries in the db // TODO
	this.on('loaded_objects', function(){});

	function endJob(req)
	{
		async.parallel([
			function(done)
			{
				jobs_req.update({
					'call': req.toString(),
					'start': req.tStart
				}, {$set: {
					'finished' : true,
					'end': req.tFinish,
					'exectime': req.ran(),
					'result': req.result
				}}, done);
			},
			function(done)
			{
				logger.info(f('Bot: Finished %s in %dms', req.toString(), req.ran()));
				mirror.emit('resulted', req);
			}
		]);
	}

	function startJob(apiObj, call)
	{
		mirror.jobs[call['sig']] = false;
		logger.info(f('Bot: Calling %s', call['sig']));

		var tStart = new Date().getTime();

		async.parallel([
			function(done)
			{
				jobs_req.insert({
					'call': call['sig'],
					'finished': false,
					'start': tStart,
					'end': -1,
					'exectime': 0,
					'result': null
				}, done);
			},
			function(done)
			{
				var req	= new Request(apiObj, call);
				mirror.jobs[call['sig']] = req;
				
				req.on('finished', function()
				{
					endJob(req);
				});

				req.run(tStart);
				mirror.emit('called', req);
				done();
			}
		]);
	}

	// main loop
	this.on('tick', function(i)
	{
		for (apiName in mirror.requestModel)
		{
			// loop through calls and make new requests for the ones that dont have active jobs AND should be called accoring to their timers
			async.each(mirror.requestModel[apiName].calls, function(call, done)
			{
				var oldReq = mirror.jobs[call['sig']];

				// if there are no finished jobs, or the last job finished less than the appropiate time before now
				if (oldReq === null || (oldReq.finished === true && (new Date().getTime() - call['timer']*1000 > oldReq.tStart)))
				{
					startJob(mirror.apis[apiName], call);
				}

				done();
			});
		}

		if (mirror.isRunning())
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

Bot.prototype.shutdown = function()
{
	logger.info('shutting down');
	this.running = false;
};

Bot.prototype.start = function()
{
	logger.info('starting');
	this.running = true;
	this.emit('tick', 1);
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
