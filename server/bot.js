var
util	= require('util'),
f 	= util.format,
fs	= require('fs'),
EE	= require('events').EventEmitter,
async	= require('async'),
Winston = require('winston'),

API	= require('./api/api.js')(),
Request	= require('./request.js')();

var logger;

function Bot(db)
{
	/**
	 * Class variables
	 */
	EE.call(this);
	this._db = db;
	this._requestModel = {};
	this._apis = {};
	this._jobs = {};
	this.running = false;

	/**
	 * Local variables
	 */
	var
	model = this._db.collection('model'),
	jobs_req = this._db.collection('jobs_req'),
	mirror = this;

	/**
	 * Local methods
	 */
	function startinit()
	{
		// load model
		model.find().toArray(function(err, data)
		{
			for(var i=0; i<data.length; i++)
			{
				mirror._requestModel[data[i].name] = data[i];
				for (var q=0; q<data[i]['calls'].length; q++)
				{
					mirror._jobs[data[i]['calls'][q]['sig']] = null;
				}
			}
			logger.info(f('Bot: API Objects: %d', data.length));
			logger.info(f('Bot: Calls: %d', Object.keys(mirror._jobs).length));
			mirror.emit('loaded_model');
		});
	}

	function startJob(apiObj, call)
	{
		mirror._jobs[call['sig']] = false;
		logger.info(f('Bot: Calling %s', call['sig']));

		var tStart = new Date().getTime();

		async.parallel([
			function(done)
			{
				jobs_req.insert({
					'sig': call['sig'],
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
				mirror._jobs[call['sig']] = req;

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

	function endJob(req)
	{
		async.parallel([
			function(done)
			{
				jobs_req.update({
					'sig': req.toString(),
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

	/**
	 * Events
	 */
	// load api objects
	this.on('loaded_model', function()
	{
		for (apiName in mirror._requestModel)
		{
			var modulePath = './api/' + mirror._requestModel[apiName]['file']; // TODO this is relative to server/, should be made absolute with a global base path
			if (fs.existsSync(modulePath))
			{
				var APIMethods = require(modulePath);
				function APIClass()
				{
					API.call(this);
				}
				util.inherits(APIClass, API);
				for (callName in APIMethods)
				{
					APIClass.prototype[callName] = APIMethods[callName];
				}
				var APIObj = new APIClass();
				APIObj.cred = mirror._requestModel[apiName].cred;
				mirror._apis[apiName] = APIObj;
				logger.info(f('Bot: Loaded module %s from %s', apiName, modulePath));
			}
		}
		mirror.emit('loaded_objects');
	});

	// cleanup, remove unfinished entries in the db // TODO
	this.on('loaded_objects', function(){});

	// main loop
	this.on('tick', function(i)
	{
		for (apiName in mirror._requestModel)
		{
			// loop through calls and make new requests for the ones that dont have active jobs AND should be called accoring to their timers
			async.each(mirror._requestModel[apiName].calls, function(call, done)
			{
				var oldReq = mirror._jobs[call['sig']];

				// if there are no finished jobs, or the last job finished less than the appropiate time before now
				if (oldReq === null || (oldReq.finished === true && (new Date().getTime() - call['timer']*1000 > oldReq.tStart)))
				{
					startJob(mirror._apis[apiName], call);
				}

				done();
			});
		}

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

	startinit();
}

util.inherits(Bot, EE);

/**
 * Class methods
 */
Bot.prototype.shutdown = function()
{
	logger.info('Bot: Shutting down');
	this.running = false;
};

Bot.prototype.start = function()
{
	logger.info('Bot: Starting');
	this.running = true;
	this.emit('tick', 1);
};

module.exports = function(verbose)
{
	logger = new Winston.Logger({transports: (verbose) ? [new Winston.transports.Console()] : []});
	return Bot;
};
