var
assert	= require('assert'),
Request = require('../request.js'),
TestAPI = require('../api/testapi.js');

describe('Request', function()
{
	var req = new Request(new TestAPI(), {
		"sig": "TestAPI.postParam()",
		"method": "postParam",
		"args": [ "bar" ],
		"timer": 20
	});

	it('string representation', function()
	{
		assert.equal(req.toString(), 'TestAPI.postParam(bar)');
	});

	it('performing request', function(done)
	{
		req.on('finished', function(data)
		{
			assert.equal(data['result'], 'OK');
			done();
		});
		req.run();
	});

	it('ran() should return an integer', function()
	{
		var ran = req.ran();
		assert.equal(typeof ran, "number");
	});
});