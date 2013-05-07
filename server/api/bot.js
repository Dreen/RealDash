var EE = require('events').EventEmitter;

function Bot()
{
	EE.call(this);
}

util.inherits(Bot, EE);

module.exports = Bot;
