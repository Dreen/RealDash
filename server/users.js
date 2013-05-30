var User = require('./user.js')();

function Users()
{
	this._users = {};
}

Users.prototype.get = function(id)
{
	return this._users[id];
}

Users.prototype.add = function(db, socket)
{
	this._users[socket.id] = new User(db, socket);
	return this._users[socket.id];
}

Users.prototype.remove = function(id)
{
	// ? this._users[id].remove();
	delete this._users[id];
}

module.exports = new Users();
