var assert = require('assert'),
	API = require('../api/api.js');

var data_address = {
	'host': 'raw.github.com',
	'path': '/Dreen/BitcoinAPIbrowser/master/server/test/data/'
}

exports['simple GET retrieval and parsing'] = function(done)
{
	var api = new API(true);
	var request = data_address;
	request['path'] += 'simple.json';
	var result = api.go(request);
	assert.ok(result['result'] == 'OK');
	done();
};