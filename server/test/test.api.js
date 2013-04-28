var assert = require('assert'),
	API = require('../api/api.js');

describe('with instance', function()
{
	var api, request;

	beforeEach(function(done)
	{
		api = new API(true);
		request = {
			'host': 'ec2-54-245-170-7.us-west-2.compute.amazonaws.com',
			'path': '/~ec2-user/data/',
			'port': 80
		};
	});

	describe('simple GET retrieval and parsing', function()
	{
		it('should parse OK', function(done)
		{
			this.request['path'] += 'simple.json';
			var result = api.go(this.request);
			assert.ok(result['result'] == 'OK');
			done();
		});
	});
});

