var query	= require('querystring'),
	hmac	= require('crypto').createHmac,
	util	= require('util');

var API		= require('./api.js').API,
	def		= require('../misc.js').def;

function MtGox()
{
	MtGox.super_.call(this, arguments);
}

util.inherits(MtGox, API); 

MtGox.prototype.request = function(callName, post, get) {
	var raw		= def(raw,	true),
		post	= def(post,	{}),
		get		= def(get,	{});
	
	post['nonce'] = (new Date()).getTime() * 1000;
	get['raw'] = 1;
	var sign = hmac('sha512', new Buffer(this.cred['SECRET'], 'base64'));
	sign.update(query.stringify(post));
	
	this.go({
		host:		'mtgox.com',
		path:		'/api/1/' + callName,
		headers:	{
			'Rest-Key':		this.cred['API_KEY'],
			'Rest-Sign':	sign.digest('base64')
		}
	}, post, get);
};

exports.MtGox = MtGox;
