var
mongo	= require('mongodb'),
io	= require('socket.io'),
Winston = require('winston'),
quitter	= require('shutdown-handler'),
fs	= require('fs'),
f 	= require('util').format,

Bot	= require('./bot.js')(true),

logger	= new Winston.Logger({transports: [new Winston.transports.Console()]}),

err_handler = function(){}; //TODO

// run as main module only
if (!module.parent)
{
	logger.info('Main: Initiating');
	var port = process.argv[2] || 8000;
	
	// connect to mongo
	mongo.MongoClient.connect("mongodb://localhost:27017/bitapi", function(err, db)
	{
		if (err) throw err;

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
		logger.info(f('Main: Serving at port %d', port));
		var server = io.listen(port);
		
		// server handler
		server.sockets.on('connection' , function(socket)
		{
			logger.info(f('connected id:%s', socket.id);
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
			logger.info('Main: Shutting down');
		});
	});
}