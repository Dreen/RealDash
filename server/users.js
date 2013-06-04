var User = require('./user.js')();

function Users(db)
{
	this._db = db;
	this.pool = {};
}

Users.prototype.get = function(id)
{
	return this.pool[id];
}

Users.prototype.add = function(socket, cb)
{
	var
	mirror = this,
	clients = this._db.collection('clients');

	function pooluser(newuser)
	{
		return function()
		{
			console.log('Pooling %s ID %s', newuser ? 'new' : 'old', socket.id); // TODO remove when we test with interface
			mirror.pool[socket.id] = new User(mirror._db, socket);
			cb(mirror.pool[socket.id]);
		};
	}

	clients.find({'uid': socket.id}).toArray(function(err, data)
	{
		if (data.length === 0)
		{
			clients.insert({
				uid : socket.id,
				lastip : socket.handshake.address.address,
				lastSeen : new Date().getTime(),
				model : { // TODO: change this to empty array when we get an interface
					"TestAPI::getSimple()": {
						api : "TestAPI",
						call : "TestAPI::getSimple()",
						last : 0
					},
					"TestAPI::postParam(bar)": {
						api : "TestAPI",
						call : "TestAPI::postParam(bar)",
						last : 0
					}
				}
			}, pooluser(true));
		}
		else if(data.length === 1)
		{
			clients.update({
				uid : socket.id
			}, {$set: {
				lastip : socket.handshake.address.address,
				lastSeen : new Date().getTime()
			}}, pooluser(false));
		}
	});
}

Users.prototype.remove = function(id)
{
	delete this.pool[id];
}

module.exports = Users;
