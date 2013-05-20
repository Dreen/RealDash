var
assert = require('assert'),
API = require('../api/api.js')();

function testSuite(APIOBJ, objname)
{
	return function()
	{
		describe('GET retrieval', function()
		{
			it('simple', function(done)
			{
				var api = new APIOBJ();

				var worker = api.go({
					'host': 'ec2-54-245-170-7.us-west-2.compute.amazonaws.com',
					'path': '/~ec2-user/data/api.get.simple.php'
				});

				worker(function(data)
				{
					assert.equal(data['result'], 'OK');
					done();
				});
			});

			it('with a parameter', function(done)
			{
				var api = new APIOBJ();
				
				var worker = api.go({
					'host': 'ec2-54-245-170-7.us-west-2.compute.amazonaws.com',
					'path': '/~ec2-user/data/api.get.param.php'
				}, null, {
					'foo': 'bar'
				});

				worker(function(data)
				{
					assert.equal(data['result'], 'OK');
					done();
				});
			});
		});

		describe('POST retrieval', function()
		{
			it('simple', function(done)
			{
				var api = new APIOBJ();
				
				var worker = api.go({
					'host': 'ec2-54-245-170-7.us-west-2.compute.amazonaws.com',
					'path': '/~ec2-user/data/api.post.simple.php',
					'method': 'POST'
				});

				worker(function(data)
				{
					assert.equal(data['result'], 'OK');
					done();
				});
			});

			it('with a parameter', function(done)
			{
				var api = new APIOBJ();
				
				var worker = api.go({
					'host': 'ec2-54-245-170-7.us-west-2.compute.amazonaws.com',
					'path': '/~ec2-user/data/api.post.param.php'
				}, {
					'foo': 'bar'
				});

				worker(function(data)
				{
					assert.equal(data['result'], 'OK');
					done();
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
	API.call(this);
}
util.inherits(TestAPI, API);
describe('child', testSuite(TestAPI, "TestAPI"));
