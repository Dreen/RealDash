var
_defs	= require('underscore').defaults,
fs	= require('fs'),
http 	= require('http'),
https 	= require('https'),
query	= require('querystring'),
Winston = require('winston'),
f 	= require('util').format;

var
misc	= require('../misc.js'),
logger;

// construct a new object for requests
function API ()
{
	this.cred = {};
}

// return a worker for the async request
API.prototype.go = function(opts, post, get)
{
	var mirror = this;
	return function(onFinished)
	{
		// default variables
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
				logger.info(f('API: <- Received %d bytes', buffer.length));
				onFinished(JSON.parse(buffer));
			});
		});
		
		// error handling
		req.on('error', function(e) {
			logger.error(f('API: Problem with request: %s', e.message));
		});
		
		// write request body
		if (misc.concrete(post))
		{
			req.write(query.stringify(post));
			logger.info(f('API: POST data: %s', query.stringify(post)));
		}
		
		logger.info(f('API: -> %s %s:%d%s', opts['method'], opts['host'], opts['port'], opts['path']));

		// finish the request
		req.end();
	};
};

module.exports = function(verbose)
{
	logger = new Winston.Logger({transports: (verbose) ? [new Winston.transports.Console()] : []});
	return API;
};
