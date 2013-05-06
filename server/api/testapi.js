var util 	= require('util'),
API		= require('./api.js').API;

/*
 * A simple API used for testing purposes.
 */

function TestAPI()
{
	TestAPI.super_.apply(this, arguments);
	this.host = 'ec2-54-245-170-7.us-west-2.compute.amazonaws.com';
}
util.inherits(TestAPI, API);

TestAPI.prototype.getSimple = function()
{
	this.go({
		'host': this.host,
		'path': '/~ec2-user/data/api.get.simple.json'
	})
};

module.exports.TestAPI = TestAPI;
