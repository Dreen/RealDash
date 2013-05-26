/* old

var util	= require('util');

var API		= require('./api.js').API;

function Bitmarket()
{
	Bitmarket.super_.call(this, arguments);
}

util.inherits(Bitmarket, API); 

Bitmarket.prototype.request = function(call_name)
{
	this.go({
		host: 'bitmarket.eu',
		path: '/api/' + call_name + '/'
	});
}

exports.Bitmarket = Bitmarket;
