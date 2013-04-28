var assert = require('assert'),
	API = require('../api/api.js');

describe('with instance', function()
{
	var api, request;
	
	beforeEach(function(done)
	{
		api = new API(true);
		request = {
			'host': 'raw.github.com',
			'path': '/Dreen/BitcoinAPIbrowser/master/server/test/data/'
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