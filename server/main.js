var io = require('socket.io');

//var misc	= require('./misc.js');

// run as main module only
if (!module.parent)
{
	var port = process.argv[2] || 8000;
	
	// TODO connect to mongo?
	
	// TODO read the server model
	
	// TODO start the request bot
	
	// TODO logging
	
	// cPool?
	
	// shutdown handler
	var shutdown = function()
	{
		onsole.log('Server shutting down');
		process.exit();
	}
	process.on('SIGTERM', shutdown);
	process.on('SIGQUIT', shutdown);
	process.on('SIGINT', shutdown);
	
	// start the server
	console.log('Serving at port %d', port);
	var server = io.listen(port);
	
	// server handler
	server.sockets.on('connection' , function(socket)
	{
		console.log('connected id:%s', socket.id);
		socket.on('message', function(msg) // TODO optional arg callback useful?
		{
			socket.send(msg);
		});
		
		socket.on('disconnect', function()
		{
			console.log('disconnected id:%s', socket.id);
		});
	});
}