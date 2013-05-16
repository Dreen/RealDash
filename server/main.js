//var io = require('socket.io');
var
mongo	= require('mongodb'),
Winston = require('winston'),
fs	= require('fs'),

Bot	= require('./bot.js')(),

logger	= new Winston.Logger({transports: [new Winston.transports.Console()]});

// run as main module only
if (!module.parent)
{
	logger.info('Initiating');
	//var port = process.argv[2] || 8000;
	
	// connect to mongo
	mongo.MongoClient.connect("mongodb://localhost:27017/bitapi", function(err, db)
	{
		if (err) throw err;

		// read the server model from a file and update it in the db
		//var model = db.collection('model');
		//model.remove({w:0});
		//var serverModel = JSON.parse(fs.readFileSync(__dirname + '/serverModel.json').toString());
		//for (var i=0; i<serverModel.length; i++)
		//{
		//	model.insert(serverModel[i], {w:0});
		//}
		
		// start the request bot
		//var bot = new Bot(db);
		//bot.start();
		
		// shutdown handler
		require('shutdown-handler').on('exit', function() {
			logger.info('Server shutting down');
		});

		// TODO server
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