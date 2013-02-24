db schema/example
----------

model:

	{
		name : "MtGox",						// index
		file : "mtgox.js",					// location: server/api/
		author : "greg.balaga@gmail.com",	
		calls : [
			{
				sig : "mtgox.currency(GBP, ticker)",
				method: "currency",
				args: [ "GBP", "depth" ],
				timer : 30
			},
			...
		]
	}

clients:

	{
		uid : "b38f7c448a08c452eb80",	// index, user ID
		lastip : "83.26.251.209",		// last IP used by user
		lastSeen : 1361657856,			// timestamp of last activitiy
		clientModel : [					// client model saved by the user
			{
				api : "MtGox",
				call : "mtgox.currency(GBP, ticker)"
			},
			...
		]
	}

jobs:

	{
		call : "mtgox.currency(7, depth)",	// call signature
		finished : true,					// job status
		start: 1352029002,					// start timestamp
		end: 1352029023,					// finish timestamp
		exectime: 2920,						// precise execution time (ms)
		result: {...}						// returned data
	}
	