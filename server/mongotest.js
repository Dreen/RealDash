var assert	= require('assert'),
mongo 		= require('mongodb');

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

describe('After connection', function()
{
	it ('Shouldnt be undefined', function()
	{
		console.log(mdb);
		assert.notStrictEqual(mdb, undefined);
	});
});