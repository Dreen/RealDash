var
mongo		= require('mongodb'),
async		= require('async'),
io		= require('socket.io'),
Winston 	= require('winston'),
//quitter		= require('shutdown-handler'),
fs		= require('fs'),
f 		= require('util').format,
	
Bot		= require('./bot.js')(),
Broadcast	= require('./broadcast.js')(true),
	
logger		= new Winston.Logger({transports: [new Winston.transports.Console()]}),

err_handler = function(){}; //TODO

// run as main module only
if (!module.parent)
{
	logger.info('Main: Init');
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
			async.each(serverModel, function(item, done)
			{
				model.insert(item, done);
			},
			function()
			{
				// start the request bot
				bot = new Bot(db);
				bot.on('loaded_objects', function()
				{
					bot.start();
					logger.info('Main: Init complete');
				});
			});
		});

		// start the server
		logger.info(f('Main: Serving at port %d', port));
		// io.set('logger', null); // TODO diable socket.io outputs, do we have to upgrade to v1.0 ?
		var
		server = io.listen(port),
		users = require('./users.js');
		
		// server handler
		server.sockets.on('connection' , function(socket)
		{
			logger.info(f('Main: Connected %s from %s', socket.id, socket.handshake.url));
			var user = users.add(socket);

			socket.on('message', function(msg) // TODO optional arg callback useful?
			{
				user.inbox(new Msg(msg));
			});
			
			socket.on('disconnect', function()
			{
				user.emit('disconnected');
			});
		});
		
		// start the broadcast thread
		var bcast = new Broadcast(db, users);
		bcast.start();
		
		// shutdown handler
		quitter.on('exit', function() {
			bot.shutdown();
			logger.info('Main: Shutting down');
		});
	});
}
