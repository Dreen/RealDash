var
assert	= require('assert'),
User	= require('../user.js')(true),
users	= require('../users.js');

var mockSocket = {
	id: "-dHkm7vtrjbWZewW6m_O",
	handshake: { 
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
	},
	flags: { endpoint: '', room: '' }
}

describe('User', function()
{
	var user = users.add(mockSocket);

	it('added to pool (lookup)', function()
	{
		assert.equal(users.get(mockSocket.id).id, mockSocket.id);
	})
});