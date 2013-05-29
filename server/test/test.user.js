var
assert	= require('assert'),
User	= require('../user.js')(true),
users	= require('../users.js'),
mongo 	= require('mongodb');

var clientModel, mockSocket, mdb, clients;

before(function(done)
{
	clientModel = {
		uid : "-dHkm7vtrjbWZewW6m_O",
		lastip : "00.00.00.000",
		lastSeen : 1369853601124,
		model : [
			{
				api : "TestAPI",
				call : "TestAPI.getSimple()",
				last : 0
			}
		]
	};

	mockSocket = {
		id: "-dHkm7vtrjbWZewW6m_O"
	};

	mongo.MongoClient.connect("mongodb://localhost:27017/bitapi_test", function(err, db)
	{
		if (err) done(err);
		else
		{
			mdb = db;
			clients = mdb.collection('clients');
			clients.remove(function()
			{
				clients.insert(clientModel, done);
			});
		}
	});
});


describe('User', function()
{
	var user;

	it('add to pool, on loaded_model: requestModel should contain a reference model call', function(done)
	{
		user = users.add(mockSocket);
		user.on('loaded_model', function()
		{
			assert.deepEqual(user.model, clientModel.model);
			done();
		});
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
		user.outbox(msg.cmd, msg.args);
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