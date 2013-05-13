//var io = require('socket.io');
var mongo 	= require('mongodb'),
fs		= require('fs');
//var misc	= require('./misc.js');

// run as main module only
if (!module.parent)
{
	//var port = process.argv[2] || 8000;
	
	// connect to mongo
	mongo.MongoClient.connect("mongodb://localhost:27017/bitapi", function(err, db)
	{
		if (err) throw err;

		// read the server model from a file and update it in the db
		var model = db.collection('model');
		model.remove({w:0});
		var serverModel = JSON.parse(fs.readFileSync(__dirname + '/serverModel.json').toString());
		for (var i=0; i<serverModel.length; i++)
		{
			model.insert(serverModel[i], {w:0});
		}
		
		console.log("done");
		
		// TODO start the request bot
		
		// TODO logging
		
		// cPool?
		
		// shutdown handler
		//var shutdown = function()
		//{
		//	onsole.log('Server shutting down');
		//	process.exit();
		//}
		//process.on('SIGTERM', shutdown);
		//process.on('SIGQUIT', shutdown);
		//process.on('SIGINT', shutdown);
		//
		//// start the server
		//console.log('Serving at port %d', port);
		//var server = io.listen(port);
		//
		//// server handler
		//server.sockets.on('connection' , function(socket)
		//{
		//	console.log('connected id:%s', socket.id);
		//	socket.on('message', function(msg) // TODO optional arg callback useful?
		//	{
		//		socket.send(msg);
		//	});
		//	
		//	socket.on('disconnect', function()
		//	{
		//		console.log('disconnected id:%s', socket.id);
		//	});
		//});
	});
}