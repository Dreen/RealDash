var
mongo		= require('mongodb'),
async		= require('async'),
Winston 	= require('winston'),
fs		= require('fs'),
f 		= require('util').format,
resolve		= require('path').resolve,

app		= require('express')()
server		= require('http').createServer(app)
io		= require('socket.io').listen(server, {log:false}),
	
Bot		= require('./bot.js')(true),
Users		= require('./users.js'),
Broadcast	= require('./broadcast.js')(true),
REST            = require('./rest.js'),
	
logger		= new Winston.Logger({transports: [new Winston.transports.Console()]}),

err_handler = function(){}; //TODO

// run as main module only
if (!module.parent)
{
	// start the server
	logger.info('Main: Init');
	var port = process.argv[2] || 8000;
	logger.info(f('Main: Serving at port %d', port));
	server.listen(port);

	// serve the console client
	app.get('/', function(req, res)
	{
		res.sendfile(resolve('../client/console.html'));
	});
	
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
					//bot.start();
					logger.info('Main: Init complete');
				});
			});
		});

		// create a global pool
		var users = new Users(db);
		
		// accept connections
		io.sockets.on('connection' , function(socket)
		{
			logger.info(f('Main: Connected %s from %s', socket.id, socket.handshake.url));
			users.add(socket, function(user)
			{
				user.on('send', function(msgObj)
				{
					socket.send(msgObj.toString());
				});

				socket.on('message', function(msg) // TODO optional arg callback useful?
				{
					user.inbox(msg);
				});
				
				socket.on('disconnect', function()
				{
					user.emit('disconnected');
				});
			});
		});

                // serve data through REST
                REST(app, db);
		
		// start the broadcast thread, pass a method to get list of users
		var bcast = new Broadcast(db, function()
		{
			var sockets = io.sockets.clients();
			var userlist = [];
			for (var i=0; i<sockets.length; i++)
			{
				userlist.push(users.get(sockets[i].id));
			}
			return userlist;
		});
		bcast.start();
		
		// shutdown handler
		//require('shutdown-handler').on('exit', function() {
		//	bot.shutdown();
		//	logger.info('Main: Shutting down');
		//});
	});
}
