var assert = require('assert'),
	API = require('../api/api.js');

function testSuite(APIOBJ, objname)
{
	return function()
	{
		describe('normal instance', function()
		{
			var result;
			var api = new APIOBJ(function(data)
			{
				result = data;
			});
			
			it(' - loading default credentials (empty object)', function()
			{
				assert.deepEqual(api.cred, {name: objname});
			});

			it(' - setting a simple callback', function()
			{
				api._onFinished('OK');
				assert.equal(result, 'OK');
			});
		});

		describe('GET retrieval', function()
		{
			it('simple', function(done)
			{
				var api = new APIOBJ(function(data)
				{
					assert.equal(data['result'], 'OK');
					done();
				});

				api.go({
					'host': 'ec2-54-245-170-7.us-west-2.compute.amazonaws.com',
					'path': '/~ec2-user/data/api.get.simple.json'
				});
			});

			it('with a parameter', function(done)
			{
				var api = new APIOBJ(function(data)
				{
					assert.equal(data['result'], 'OK');
					done();
				});
				
				api.go({
					'host': 'ec2-54-245-170-7.us-west-2.compute.amazonaws.com',
					'path': '/~ec2-user/data/api.get.param.php'
				}, null, {
					'foo': 'bar'
				});
			});
		});

		describe('POST retrieval', function()
		{
			it('simple', function(done)
			{
				var api = new APIOBJ(function(data)
				{
					assert.equal(data['result'], 'OK');
					done();
				});
				
				api.go({
					'host': 'ec2-54-245-170-7.us-west-2.compute.amazonaws.com',
					'path': '/~ec2-user/data/api.post.simple.php',
					'method': 'POST'
				});
			});

			it('with a parameter', function(done)
			{
				var api = new APIOBJ(function(data)
				{
					assert.equal(data['result'], 'OK');
					done();
				});
				
				api.go({
					'host': 'ec2-54-245-170-7.us-west-2.compute.amazonaws.com',
					'path': '/~ec2-user/data/api.post.param.php'
				}, {
					'foo': 'bar'
				});
			});
		});
	};
}

// parent
describe('parent', testSuite(API, "API"));

// child
var util = require('util');
function TestAPI(onFinished)
{
	API.call(this, onFinished);
}
util.inherits(TestAPI, API);
describe('child', testSuite(TestAPI, "TestAPI"));
