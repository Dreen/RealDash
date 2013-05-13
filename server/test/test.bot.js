var
assert	= require('assert'),
mongo 	= require('mongodb'),
Bot	= require('../bot.js');

var ref, mdb;

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
			var model = db.collection('model');
			model.remove(function()
			{
				model.insert(ref, done);
			});
		}
	});
});

describe('Bot Event', function()
{
	it('on loaded_model: requestModel should contain the model of TestAPI', function(done)
	{
		var bot = new Bot(mdb);
		bot.on('loaded_model', function()
		{
			assert.deepEqual(bot.requestModel['TestAPI'], ref);
			done();
		});
		
	});

	it('on loaded_objects: apis should contain an included API module', function(done)
	{
		var bot = new Bot(mdb);
		bot.on('loaded_objects', function()
		{
			assert.deepEqual(bot.apis['TestAPI'], require('../api/testapi.js'));
			done();
		});
	});

	it('on shutdown_complete: shutting down, should detect an event', function(done)
	{
		var bot = new Bot(mdb);
		bot.on('shutdown_complete', function(sig)
		{
			assert.ok(true);
			done();
		});
		bot.shutdown();
	});

	it('on called: should get a Request object with a valid call spec', function(done)
	{
		var bot = new Bot(mdb);
		bot.on('called', function(request)
		{
			assert.deepEqual(request.spec, ref);
			done();
		});
	});

	describe('on resulted: should get a Request object representing a *finished* TestAPI with:', function(done)
	{
		var bot = new Bot(mdb);
		bot.on('resulted', function(request)
		{
			it('valid call spec', function()
			{
				assert.deepEqual(request.spec, ref);
			});
			
			it('valid result', function()
			{
				assert.deepEqual(request.result, {"result": "OK"});
			});

			it('run time greater than 0', function()
			{
				var ran = request.ran();
				assert.equal(typeof ran, "number");
				assert.ok(ran > 0);
			});

			done();
		});
	});
});
