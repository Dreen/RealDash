var assert = require('assert'),
	API = require('../api/api.js');

var data_address = {
	'host': 'raw.github.com',
	'path': '/Dreen/BitcoinAPIbrowser/master/server/test/data/'
}

module.exports['with instance'] = {

	before: function(done)
	{
		this.api = new API(true);
		this.request = data_address;
	},

	'simple GET retrieval and parsing': function(done)
	{
		this.request['path'] += 'simple.json';
		var result = api.go(this.request);
		assert.ok(result['result'] == 'OK');
		done();
	}
}