var
assert	= require('assert'),
mongo 	= require('mongodb'),
Bot	= require('../bot.js');

var mdb, bot;
before(function(done)
{
	mongo.MongoClient.connect("mongodb://localhost:27017", function(err, db)
	{
		if (err) done(err);
		else
		{
			mdb = db;
			done();
		}
	});
});

describe('Bot', function()
{
	it('set up instance, verbosity should be true', function()
	{
		bot = new Bot(mdb, true);
		assert(bot.verboseRequests);
	});

	it('serverModel should contain the model of TestAPI', function()
	{
		var ref = {
			"name" : "TestAPI",
			"file" : "testapi.js",
			"author" : "greg.balaga@gmail.com",	
			"calls" : [
				{
					"sig" : "TestAPI.getSimple()",
					"method": "getSimple",
					"args": [ ],
					"timer" : 30
				}
			]
		};
		assert.deepEqual(bot.serverModel['TestAPI'], ref);
	});

	it('apis should contain an instance of TestAPI', function()
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