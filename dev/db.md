db schema/example
----------

model:

	{
		"name": "TestAPI",			// index
		"file": "testapi.js",			// located in server/api/
		"author": "greg.balaga@gmail.com",
		"cred": {
			"his identification": "you dont need to see it"
		},
		"calls": [
			{
				"sig": "TestAPI.getSimple()",
				"method": "getSimple",
				"args": [ ],
				"timer": 30
			},
			...
		]
	}

clients:

	{
		uid : "-dHkm7vtrjbWZewW6m_O",	// index, user ID
		lastip : "00.00.00.000",	// last IP used by user
		lastSeen : 1369853601124,	// timestamp of last activitiy (ms)
		model : [			// client model saved by the user
			{
				api : "TestAPI",
				call : "TestAPI.getSimple()"
			},
			...
		]
	}

jobs:

	{
		call : "mtgox.currency(7, depth)",	// call signature
		finished : true,			// job status
		start: 1352029002,			// start timestamp
		end: 1352029023,			// finish timestamp
		exectime: 2920,				// precise execution time (ms)
		result: {...}				// returned data
	}
	