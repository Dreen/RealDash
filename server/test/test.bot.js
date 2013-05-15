var
assert	= require('assert'),
mongo 	= require('mongodb');

var ref, mdb, model, jobs_req;

before(function(done)
{
	ref = {
		"name": "TestAPI",
		"file": "testapi.js",
		"author": "greg.balaga@gmail.com",	
		"calls": [
			{
				"sig": "TestAPI.getSimple()",
				"method": "getSimple",
				"args": [ ],
				"timer": 30
			}
		]
	};

	mongo.MongoClient.connect("mongodb://localhost:27017/bitapi_test", function(err, db)
	{
		if (err) done(err);
		else
		{
			mdb = db;
			model = mdb.collection('model');
			jobs_req = mdb.collection('jobs_req');
			model.remove(function()
			{
				model.insert(ref, done);
			});
		}
	});
});

describe('Bot Event', function()
{
	it('on loaded_model: requestModel should contain the model of TestAPI and a null for its call in #jobs', function(done)
	{
		var Bot	= require('../bot.js')();
		var bot = new Bot(mdb);
		bot.removeAllListeners(); // dont test further
		bot.on('loaded_model', function()
		{
			assert.deepEqual(bot.requestModel['TestAPI'], ref);
			assert.strictEqual(bot.jobs["TestAPI.getSimple()"], null);
			bot.shutdown();
			done();
		});
		
	});

	it('on loaded_objects: apis should contain an included API module', function(done)
	{
		var Bot	= require('../bot.js')();
		var bot = new Bot(mdb);
		bot.removeAllListeners('loaded_objects'); // dont test further
		bot.on('loaded_objects', function()
		{
			assert.deepEqual(bot.apis['TestAPI'], require('../api/testapi.js'));
			bot.shutdown();
			done();
		});
	});

	it('on shutdown_complete: shutting down, should detect an event', function(done)
	{
		jobs_req.remove(function()
		{
			var Bot	= require('../bot.js')();
			var bot = new Bot(mdb);
			bot.on('shutdown_complete', function()
			{
				assert.ok(true);
				done();
			});
			bot.start();
			bot.shutdown();
		});
	});

	it('on called: should get a Request object with a valid call spec', function(done)
	{
		jobs_req.remove(function()
		{
			var Bot	= require('../bot.js')();
			var bot = new Bot(mdb);
			bot.on('called', function(request)
			{
				assert.deepEqual(request.spec, ref.calls[0]);
				bot.shutdown();
				done();
			});
				
			bot.start();
		});
	});

	describe('on resulted: should get a Request object with:', function()
	{
		it('valid call spec', function(done)
		{
			jobs_req.remove(function()
			{
				var Bot = require('../bot.js')();
				var bot = new Bot(mdb);
				bot.on('resulted', function(request)
				{
					assert.deepEqual(request.spec, ref.calls[0]);
					bot.shutdown();
					done();
				});
				
				bot.start();
			});
		});
			
		it('valid result', function(done)
		{
			jobs_req.remove(function()
			{
				var Bot	= require('../bot.js')();
				var bot = new Bot(mdb);
				bot.on('resulted', function(request)
				{
					assert.deepEqual(request.result, {"result": "OK"});
					bot.shutdown();
					done();
				});
				
				bot.start();
			});
		});

		it('run time greater than 0', function(done)
		{
			jobs_req.remove(function()
			{
				var Bot	= require('../bot.js')(true);
				var bot = new Bot(mdb);
				bot.on('resulted', function(request)
				{
					var ran = request.ran();
					assert.equal(typeof ran, "number");
					assert.ok(ran > 0);
					bot.shutdown();
					done();
				});
				
				bot.start();
			});
		});
	});
});
