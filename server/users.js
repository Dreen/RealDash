var User = require('./user.js')();

functions Users()
{
	this._users = {};
}

Users.prototype.get = function(id)
{
	return this._users[id];
}

Users.prototype.add = function(client)
{
	this._users[client.id] = new User(client);
}

Users.prototype.remove = function(id)
{
	// ? this._users[id].remove();
	del this._users[id];
}

module.exports = new Users();
