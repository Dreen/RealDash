var
assert	= require('assert'),
util	= require('util'),
API	= require('../api/api.js')(),
Request = require('../request.js')();

describe('Request', function()
{
	var TestAPIMethods = require('../api/testapi.js');
	function TestAPI()
	{
		API.call(this);
	}
	util.inherits(TestAPI, API);
	for (callName in TestAPIMethods)
	{
		TestAPI.prototype[callName] = TestAPIMethods[callName];
	}
	var req = new Request(new TestAPI(), {
		"sig": "TestAPI.postParam(bar)",
		"method": "postParam",
		"args": [ "bar" ],
		"timer": 20
	});

	it('toString() should return the call signature', function()
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

	it('ran() should return an integer greater than 0', function()
	{
		var ran = req.ran();
		assert.equal(typeof ran, "number");
		assert.ok(ran > 0);
	});
});