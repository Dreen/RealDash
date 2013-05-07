var assert	= require('assert'),
mongo 		= require('mongodb'),
Bot		= require('../api/bot.js');

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
	it('fake test to set up the bot instance', function()
	{
		bot = new Bot(mdb, true);
		assert(true);
	});

	it('serverModel should contain the model of TestAPI', function()
	{
		var ref = {
			"name" : "TestAPI",
			"file" : "testapi.js",
			"author" : "greg.balaga@gmail.com",	
			"calls" : [
				{
					"sig" : "testapi.getSimple()",
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
});