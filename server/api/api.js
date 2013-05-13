var
_defs		= require('underscore').defaults,
fs		= require('fs'),
http 		= require('http'),
https 		= require('https'),
query		= require('querystring');

var
misc	= require('../misc.js'),
logger	= require('../log.js');

// construct a new object for requests
function API (onFinished)
{
	// load credentials
	if (fs.existsSync(__dirname + '/cred/' + this.constructor.name + '.cred'))
	{
		this.cred = JSON.parse(fs.readFileSync(__dirname + '/cred/' + this.constructor.name + '.cred').toString());
	}
	else
	{
		this.cred = JSON.parse(fs.readFileSync(__dirname + '/cred/API.cred').toString());
	}
	
	// default callback
	this._onFinished = onFinished || function (data) { logger.info('%j', data); };
}

// launch an async request
API.prototype.go = function(opts, post, get)
{
	// default variables
	mirror	= this;
	post	= post || {};
	get	= get || {};

	// figure out if we want to use https
	var prot = (opts.port == 443) ? https : http;
	
	// default options
	opts = _defs(opts, {
		host:		'localhost',
		path:		'',
		port:		80,
		method:		'GET',
		headers:	{}
	});
	
	// switch to post if any post data is given
	if (misc.concrete(post))
	{
		opts.method = 'POST';
	}
	
	// write get variables into the query string
	if (misc.concrete(get))
	{
		opts.path += '?' + query.stringify(get);
	}

	// extra headers
	opts.headers['User-Agent'] = opts.headers['User-Agent'] || "Mozilla/5.0 (X11; Linux i686; rv:10.0) Gecko/20100101 Firefox/10.0";
	if (misc.concrete(post))
	{
		opts.headers['Content-type'] = "application/x-www-form-urlencoded";
	}
	
	// create request object
	var req = prot.request(opts, function (result) {
		result.setEncoding('utf8');
		var buffer = '';
		result.on('data', function(data) {
			buffer += data;
		});
		result.on('end', function() {
			logger.info('<- Received %d bytes', buffer.length);
			mirror._onFinished(JSON.parse(buffer));
		});
	});
	
	// error handling
	req.on('error', function(e) {
		logger.error('warning: problem with request: %s', e.message);
	});
	
	// write request body
	if (misc.concrete(post))
	{
		req.write(query.stringify(post));
		logger.info('POST data: %s', query.stringify(post));
	}
	
	logger.info('-> %s %s:%d%s', opts['method'], opts['host'], opts['port'], opts['path']);

	// finish the request
	req.end();
};

// set custom callback
API.prototype.setCallback = function(cb) {
	if (typeof this.callback == "function")
	{
		this.callback = cb;
	}
};

module.exports = API;
