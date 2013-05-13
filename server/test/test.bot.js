var
assert	= require('assert'),
mongo 	= require('mongodb'),
Bot	= require('../bot.js');

var bot, ref, mdb;

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
			}, {
				"sig": "TestAPI.postParam(bar)",
				"method": "postParam",
				"args": [ "bar" ],
				"timer": 20
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
	it('requestModel should contain the model of TestAPI', function(done)
	{

		var bot = new Bot(mdb);
		bot.on('loaded_model', function()
		{
			assert.deepEqual(bot.requestModel['TestAPI'], ref);
			done();
		});
		
	});

	it('apis should contain an included API module', function(done)
	{
		var bot = new Bot(mdb);
		bot.on('loaded_objects', function()
		{
			assert.deepEqual(bot.apis['TestAPI'], require('../api/testapi.js'));
			done();
		});
	});

	it('shutting down, should detect an event', function(done)
	{
		var bot = new Bot(mdb);
		bot.on('shutdown_complete', function(sig)
		{
			assert.ok(true);
			done();
		});
		bot.shutdown();
	});

	it('should detect a call made to TestAPI', function(done)
	{
		bot.on('called', function(sig)
		{
			assert.equal(sig, "testapi.getSimple()");
			done();
		});
	});

	it('should detect a call return from TestAPI', function(done)
	{
		bot.on('resulted', function(sig, result)
		{
			assert.equal(sig, "testapi.getSimple()");
			assert.deepEqual(result, {"result": "OK"});
			done();
		});
	});
});