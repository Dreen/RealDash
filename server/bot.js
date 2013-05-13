var
util	= require('util'),
EE	= require('events').EventEmitter;

function Bot(db)
{
	EE.call(this);
	this.db = db;
	this.requestModel = {};

	var mirror = this;
	var model = db.collection('model');
	model.find().toArray(function(err, data)
	{
		for(var i=0; i<data.length; i++)
		{
			//delete data[i]._id;
			mirror.requestModel[data[i].name] = data[i];
		}
		mirror.emit('modelIsLoaded');
	});
}

util.inherits(Bot, EE);

module.exports = Bot;
