var
util	= require('util'),
fs	= require('fs'),
EE	= require('events').EventEmitter;

function Bot(db)
{
	EE.call(this);
	this.db = db;
	this.requestModel = {};
	this.apis = {};
	this.running = false;

	var model = this.db.collection('model');
	var mirror = this;

	// load model
	model.find().toArray(function(err, data)
	{
		for(var i=0; i<data.length; i++)
		{
			mirror.requestModel[data[i].name] = data[i];
		}
		mirror.emit('loaded_model');
	});

	// load objects
	mirror.on('loaded_model', function()
	{
		for (apiName in mirror.requestModel)
		{
			var modulePath = './api/' + mirror.requestModel[apiName]['file'];
			if (fs.existsSync(modulePath))
			{
				mirror.apis[apiName] = require(modulePath);	
			}
		}
		mirror.emit('loaded_objects');
	});

	// main loop
	mirror.on('loaded_objects', function()
	{
		while(true)
		{


			if (!mirror.running)
			{
				break;
			}
		}
		mirror.emit('shutdown_complete');
	});
}

util.inherits(Bot, EE);

Bot.prototype.shutdown = function()
{
	this.running = false;
};

module.exports = Bot;
