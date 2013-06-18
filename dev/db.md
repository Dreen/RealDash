db schema/example
----------

apis:

	{
		"name": "TestAPI",			// index
		"file": "testapi.js",			// located in server/api/
		"author": "greg.balaga@gmail.com",
		"cred": {
			"his identification": "you dont need to see it"
		},
		"calls": [
			{
				"sig": "TestAPI::getSimple()",
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
		model : {			// client model saved by the user
			"TestAPI::getSimple()": {
				api : "TestAPI",
				sig : "TestAPI::getSimple()",
				last : 1369853601124
			},
			...
		}
	}

jobs_req:

	{
		'sig': "TestAPI::getSimple()",
		'finished': true,
		'start': 1369853601124,
		'end': 1369853602124,
		'exectime': 1000,
		'result': {"result": "OK"}
	}
	