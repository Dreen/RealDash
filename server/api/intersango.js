var query	= require('querystring'),
	hmac	= require('crypto').createHmac,
	util	= require('util');

var API		= require('./api.js').API,
	def		= require('../misc.js').def;

function Intersango()
{
	Intersango.super_.call(this, arguments);
}

util.inherits(Intersango, API); 

Intersango.prototype.request_data = function(call_name)
{
	this.go({
		host:	'intersango.com',
		method:	'GET',
		path:	'/api/' + call_name + '.php'
	});
	
	/*
	{
		api_key: this.cred['api_key']
	}
	*/
}

Intersango.prototype.request_auth = function(call_name, params)
{
	var post	= def(params,	{});
	
	post['api_key'] = this.cred['api_key'];
	
	this.go({
		host:	'intersango.com',
		path:	'/api/authenticated/v0.1/' + call_name + '.php'
	}, post);
};

exports.Intersango = Intersango;
