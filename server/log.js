var Winston = require('winston');

module.exports = new Winston.Logger({
	transports: [
		new Winston.transports.Console()
	]
});

// TODO: what would be cool if we could log into MongoDB, like an `api_log` collection and log by different apis and calls