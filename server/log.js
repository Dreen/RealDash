var Winston = require('winston');

module.exports = new Winston.Logger({
	transports: [
		new Winston.transports.Console()
	]
});