var assert = require('assert'),
	API = require('../api/api.js');

describe('with instance', function()
{
	var api = new API(true);

	it('setting verbose mode', function()
	{
		assert.strictEqual(api.verbose, true);
	});
	
	it('loading default credentials', function()
	{
		assert.deepEqual(api.cred, {});
	});

	describe('and with a child instance', function()
	{
		var util = require('util');
		function TestAPI()
		{
			TestAPI.super_.call(this, arguments);
		}
		util.inherits(TestAPI, API);
		var testapi = new TestAPI(true);
		
		it('setting verbose mode by child object', function()
		{
			assert.strictEqual(testapi.verbose, true);
		});
	});

	describe('simple callback', function()
	{
		var result;
		api.setCallback(function(data)
		{
			result = data;
		});
		api.callback('OK');
		
		it('should be set to OK', function()
		{
			assert.equal(result, 'OK');
		});
	});

/*
	describe('simple GET retrieval and parsing', function()
	{
		it('should parse OK', function(done)
		{
			var result = api.go({
				'host': 'ec2-54-245-170-7.us-west-2.compute.amazonaws.com',
				'path': '/~ec2-user/data/simple.json',
				'port': 80
			});
			api.go(request);
			assert.ok(result['result'] == 'OK');
			done();
		});
	});
*/
});

