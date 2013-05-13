var
util 	= require('util'),
API	= require('./api.js');

/*
 * A simple API used for testing purposes.
 */

function TestAPI(onFinished)
{
	API.call(this, onFinished);
}
util.inherits(TestAPI, API);

TestAPI.prototype.getSimple = function()
{
	this.go({
		'host': 'ec2-54-245-170-7.us-west-2.compute.amazonaws.com',
		'path': '/~ec2-user/data/api.get.simple.json'
	});
};

TestAPI.prototype.postParam = function(foobar)
{
	this.go({
		'host': 'ec2-54-245-170-7.us-west-2.compute.amazonaws.com',
		'path': '/~ec2-user/data/api.post.param.php'
	}, {
		'foo': foobar
	});
};

module.exports = TestAPI;
