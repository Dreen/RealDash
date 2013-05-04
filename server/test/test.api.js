var assert = require('assert'),
	API = require('../api/api.js');

function testSuite(APIOBJ, objname)
{
	return function()
	{
		describe('normal instance', function()
		{
			var api = new APIOBJ();

			it(' - verbosity level', function()
			{
				assert.strictEqual(api.verbose, false);
			});
			
			it(' - loading default credentials (empty object)', function()
			{
				assert.deepEqual(api.cred, {name: objname});
			});

			it(' - setting a simple callback', function()
			{
				var result;
				api.setCallback(function(data)
				{
					result = data;
				});
				api.callback('OK');
				assert.equal(result, 'OK');
			});
		});

		describe('verbose instance', function()
		{
			var api = new APIOBJ(true);
			
			it(' - verbosity level', function()
			{
				assert.strictEqual(api.verbose, true);
			});
		});

		describe('GET retrieval', function()
		{
			var api = new APIOBJ();
			it('simple', function(done)
			{
				api.setCallback(function(data)
				{
					assert.equal(data['result'], 'OK');
					done();
				});

				api.go({
					'host': 'ec2-54-245-170-7.us-west-2.compute.amazonaws.com',
					'path': '/~ec2-user/data/simple.json',
					'port': 80
				});
			});
		});
	};
}

// parent
describe('parent', testSuite(API, "API"));

// child
var util = require('util');
function TestAPI()
{
	TestAPI.super_.apply(this, arguments);
}
util.inherits(TestAPI, API);
describe('child', testSuite(TestAPI, "TestAPI"));


