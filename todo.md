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


some jq expressions
----------
cat samples/mtgoxGBPticker.json | jq '[.vol, .sell, .avg, .vwap | .value | tonumber | select(. < 100)]'
