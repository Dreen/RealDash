functions Users()
{
	this._clients = {};
}

Users.prototype.get = function(id)
{
	return this._clients[id];
}

Users.prototype.add = function(client)
{
	this._clients[client.id] = client;
}

Users.prototype.remove = function(id)
{
	del this._clients[id];
}

module.exports = new Users();
