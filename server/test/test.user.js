var
assert	= require('assert'),
User	= require('../user.js')(true),
EE	= require('events').EventEmitter,
users	= require('../users.js');

function MockSocket()
{
	EE.call(this);
	this.id = "-dHkm7vtrjbWZewW6m_O";
	this.handshake = { 
		headers: {
			'accept-language': 'en-GB,en;q=0.8,en-US;q=0.6',
			origin: 'null',
			'user-agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrom... (length: 108)',
			host: '127.0.0.1:8000',
			dnt: '1',
			'accept-encoding': 'gzip,deflate,sdch',
			'cache-control': 'max-age=0',
			connection: 'keep-alive',
			accept: '*/*'
		},
		address: { address: '127.0.0.1', port: 53042 },
		url: '/socket.io/1/?t=1369690849393',
		xdomain: true,
		secure: undefined,
		time: 'Mon May 27 2013 22:40:49 GMT+0100 (GMT Daylight Time)',
		query: { t: '1369690849393' }
	};
	this.flags = { endpoint: '', room: '' };

	this.on('close', function(){console.log('socket:close')});
	this.on('message', function(){console.log('socket:message')});
	this.on('error', function(){console.log('socket:error')});
	this.on('flush', function(){console.log('socket:flush')});
	this.on('drain', function(){console.log('socket:drain')});
	this.on('packet', function(){console.log('socket:packet')});
	this.on('packetCreate', function(){console.log('socket:packetCreate')});
}

util.inherits(mockSocket, EE);

MockSocket.prototype.send = function(msg){console.log('socket.send ' + msg)};
MockSocket.prototype.close = function(){console.log('socket.close')};

describe('User', function()
{
	var user = users.add(new MockSocket());

	it('added to pool (lookup)', function()
	{
		assert.equal(users.get(mockSocket.id).id, mockSocket.id);
	});

	it('receive a valid message', function(done)
	{
		var msg = {
			cid: "-dHkm7vtrjbWZewW6m_O",
			cmd: "test",
			args: [1, 2, 3]
		};
		user.on('recv', function(msg)
		{
			assert.ok(msg.isValid);
			assert.equal(msg.getCmd());
			done();
		});
		user.inbox(msg);
	});
});