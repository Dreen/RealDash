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

describe('Bot', function()
{
	it('requestModel should contain the model of TestAPI', function(done)
	{

		var bot = new Bot(mdb);
		bot.on('modelIsLoaded', function()
		{
			assert.deepEqual(bot.requestModel['TestAPI'], ref);
			done();
		});
		
	});

	it('apis should contain an initialised API object', function()
	{
		assert(bot.apis['TestAPI'] instanceof require('../api/testapi.js').TestAPI);
	});

	describe('Events', function()
	{
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
});