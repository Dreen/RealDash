var
assert	= require('assert'),
mongo 	= require('mongodb');

var clientModel, mockSocket, mdb, clients;

before(function(done)
{
	clientModel = {
		uid : "-dHkm7vtrjbWZewW6m_O",
		lastip : "00.00.00.000",
		lastSeen : 1369853601124,
		model : {
			"TestAPI::getSimple()": {
				api : "TestAPI",
				call : "TestAPI::getSimple()",
				last : 0
			}
		}
	};

	mockSocket = {
		id: "-dHkm7vtrjbWZewW6m_O",
		handshake: {
			address: {
				address: "0.0.0.0"
			}
		}
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
	it('on loaded_model: requestModel should contain a reference model call', function(done)
	{
		var User = require('../user.js')();
		var user = new User(mdb, mockSocket);
		user.on('loaded_model', function()
		{
			assert.deepEqual(user.model, clientModel.model);
			done();
		});
		user.on('error', function(msg)
		{
			assert.ok(false);
			console.log(msg);
			done();
		});
	});

	it('receive a valid message', function(done)
	{
		var User = require('../user.js')();
		var user = new User(mdb, mockSocket);
		var msg = {
			cid: "-dHkm7vtrjbWZewW6m_O",
			cmd: "test",
			args: [1, 2, 3]
		};
		user.on('recv', function(msg)
		{
			assert.ok(msg.isValid);
			assert.equal(msg.getCmd(), "test");
			done();
		});
		user.inbox(msg);
	});

	it('send a valid message', function(done)
	{
		var User = require('../user.js')();
		var user = new User(mdb, mockSocket);
		var msg = {
			cid: "-dHkm7vtrjbWZewW6m_O",
			cmd: "test",
			args: [1, 2, 3]
		};
		user.on('send', function(msg)
		{
			assert.ok(msg.isValid);
			assert.equal(msg.getCmd(), "test");
			done();
		});
		user.outbox(msg.cmd, msg.args);
	});

	it('receive an invalid message - should send back a server error', function(done)
	{
		var User = require('../user.js')();
		var user = new User(mdb, mockSocket);
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

	it('try to send an invalid meesage - should not send and generate an error', function(done)
	{
		var User = require('../user.js')();
		var user = new User(mdb, mockSocket);
		user.on('send', function()
		{
			assert.ok(false);
			done();
		});
		user.on('error', function(msg)
		{
			assert.equal(msg, 'Invalid server message');
			done();
		});
		user.outbox([1, 2, 3]);
	});
});