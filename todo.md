Node

	./client/lib/APIBrowser.js: 127: if(type == 'cookiedata') // TODO get rid of this nonsense and abstract saved cm
	./client/lib/APIBrowser.js: 181: if($(this).attr('id').split('-')[1] == 'cookiedata') // TODO get rid of this nonsense and abstract saved cm
	./client/lib/APIBrowser.js: 210: $newDiv.children('span').addClass('badge-'+((type=='error')?'warning':type)); // TODO the colors are all wrong
	./client/lib/wsclient.js: 111: // TODO aggregate messages in local storage (APIBrowser feature when messages from bot are implemented)
	./client/lib/wsclient.js: 145: Yet, still, if the server sends eg. an empty array [] the arg is undefined ... // TODO
	./client/APIBrowser.html: 114: <!-- TODO: implement data-loading-text="Connecting..." //-->
	./server/RequestBot.py:  66: if t - self.updateInterval > self.res['request_time']: # TODO individual timers
	./server/api/httpBot.py:  55: if h[0] == 'Set-Cookie': # TODO there seems to still be some issues with parsing cookies, ex google.com
	./server/api/mtgox.py:  51: # TODO implement rest https://en.bitcoin.it/wiki/MtGox/API/HTTP/v1:
	./server/WebSocketServer/WSServer.py:  14: # TODO wsgi multithreaded?
	./server/WebSocketServer/WSClient.py:  38: self.broadcastPaused = True # TODO unique
	
	
	NEEDS WORK (in this order):
	* WSBroadcast.py: based on individual client's model
	* APIBrowser.js: handle broadcast
	* Intersango requests failing
	* RequestBot seems to initially

	
db schema/example
----------
servermodel:

	{
		"sig" : "mtgox.currency(7, depth)",	// index
		"api" : "mtgox", 
		"method" : "currency"
		"args" : [ 7, "depth" ],
		"timer" : 30
	}

clients:

	{
		"uid" : "b38f7c448a08c452eb80",		// index, user ID
		"lastip" : "83.26.251.209",			// last IP used by user
		"savedModel" : [					// client model saved by the user
			{"api" : "mtgox", "method" : "currency", "args" : [11,"ticker"]},
			{"api" : "mtgox", "method" : "currency", "args" : [7,"depth"]}
			]
	}

jobs:

	{
		"sig" : "mtgox.currency(7, depth)",	// call signature
		"finished" : true,					// job status
		"start": 1352029002,				// start timestamp
		"end": 1352029023,					// finish timestamp
		"exectime": 2920,					// precise execution time (ms)
		"result": {...}						// returned data
	}
		

jq
----------
`cat samples/mtgoxGBPticker.json | jq '[.vol, .sell, .avg, .vwap | .value | tonumber | select(. < 100)]'`
