var
assert	= require('assert'),
User	= require('../user.js')(true),
users	= require('../users.js');

describe('User', function()
{
	var user = users.add({
		id: "-dHkm7vtrjbWZewW6m_O"
	});

	it('loaded model', function()
	{
		assert.ok(false);
	});

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

	it('send a valid message', function(done)
	{
		var msg = {
			cid: "-dHkm7vtrjbWZewW6m_O",
			cmd: "test",
			args: [1, 2, 3]
		};
		user.on('send', function(msg)
		{
			assert.ok(msg.isValid);
			assert.equal(msg.getCmd());
			done();
		});
		user.outbox(msg);
	});

	it('receive an invalid message - should send back a server error', function(done)
	{
		var msg = {
			cid: "-dHkm7vtrjbWZewW6m_O",
			args: [1, 2, 3]
		};
		user.on('send', function(msg)
		{
			assert.ok(msg.isValid);
			assert.equal(msg.getCmd(), 'serverError');
			assert.equal(msg.getArgs(0), 'Invalid client message');
			done();
		});
		user.inbox(msg);
	});

	it('try to send an invalid meesage - should not send', function(done)
	{
		var msg = {
			cid: "-dHkm7vtrjbWZewW6m_O",
			args: [1, 2, 3]
		};
		user.on('send', function(msg)
		{
			assert.ok(msg.isValid);
			assert.equal(msg.getCmd(), 'serverError');
			assert.equal(msg.getArgs(0), 'Invalid client message');
			done();
		});
		user.inbox(msg);
	});
});