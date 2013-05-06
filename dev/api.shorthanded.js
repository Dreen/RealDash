var _defs	= require('underscore').defaults,
fs		= require('fs'),
http 		= require('http'),
https 		= require('https'),
inherit		= require('util').inherits,
query		= require('querystring');

var misc	= require('../misc.js');

// construct a new object for requests
function API (verbosity)
{
	// default arguments
	this.verbose = verbosity || false;
	
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
	this.callback = function (data) { console.log('%j', data); };
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
			if (mirror.verbose)
			{
				console.log('<- Received %d bytes', buffer.length);
			}
			var data = JSON.parse(buffer);

			mirror.callback(data);
		});
	});
	
	// error handling
	req.on('error', function(e) {
		console.log('warning: problem with request: %s', e.message);
	});
	
	// write request body
	if (misc.concrete(post))
	{
		req.write(query.stringify(post));
		if (this.verbose)
		{
			console.log('POST data: %s', query.stringify(post));
		}
	}
	
	if (this.verbose)
	{
		console.log('-> %s %s:%d%s', opts['method'], opts['host'], opts['port'], opts['path']);
	}

	// finish the request
	req.end();
};

// set custom callback
API.prototype.setCallback = function(cb)
{
	if (typeof this.callback == "function")
	{
		this.callback = cb;
	}
};

//module.exports.API = API;


// a shorthand to get a child instance
module.exports.api = function(constr)
{
	function child()
	{
		child.super_.apply(this, arguments);
		if (typeof constr == "function")
		{
			constr.apply(this, arguments);
		}
	}
	inherit(child, API);
	return child;
};