var
mongo	= require('mongodb'),
io	= require('socket.io'),
Winston = require('winston'),
quitter	= require('shutdown-handler'),
fs	= require('fs'),

Bot	= require('./bot.js')(),

logger	= new Winston.Logger({transports: [new Winston.transports.Console()]}),

err_handler = function(){}; //TODO

// run as main module only
if (!module.parent)
{
	logger.info('Initiating');
	var port = process.argv[2] || 8000;
	
	// connect to mongo
	mongo.MongoClient.connect("mongodb://localhost:27017/bitapi", function(err, db)
	{
		// read the server model from a file and update it in the db
		var model = db.collection('model'),
		bot;
		model.remove(function()
		{
			var serverModel = JSON.parse(fs.readFileSync(__dirname + '/serverModel.json').toString());
			for (var i=0; i<serverModel.length; i++)
			{
				model.insert(serverModel[i], (i < serverModel.length - 1) ? err_handler : function()
				{
					// start the request bot
					bot = new Bot(db);
					bot.start();
				});
			}
		});

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
		
		// shutdown handler
		quitter.on('exit', function() {
			bot.shutdown();
			logger.info('Server shutting down');
		});
	});
}