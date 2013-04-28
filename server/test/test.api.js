var assert = require('assert'),
	API = require('../api/api.js');

var data_address = {
	'host': 'raw.github.com',
	'path': '/Dreen/BitcoinAPIbrowser/master/server/test/data/'
}

if (module == require.main)
{
	var mocha = require('child_process').spawn('mocha', [ '--colors', '--ui', 'exports', '--reporter', 'spec', __filename ]);
	mocha.stdout.pipe(process.stdout);
	mocha.stderr.pipe(process.stderr);
}

exports['with instance'] = {

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