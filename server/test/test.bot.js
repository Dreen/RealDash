var assert	= require('assert'),
mongo 		= require('mongodb'),
Bot		= require('../api/bot.js');

var mdb;
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

describe('connected', function()
{
	console.log(mdb);
	var bot = new Bot(mdb, true);

	it('retrieved TestAPI from db', function()
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

	it('initialised TestAPI correctly', function()
	{
		assert(bot.apis['TestAPI'] instanceof require('../api/testapi.js').TestAPI);
	});
});