import sys
import json

from gevent import monkey

from WebSocketServer.WSServer import Server
from RequestBot import Bot
from Handlers import *
from db import getDB

if __name__ == "__main__":
	arg = ''.join(sys.argv[1:]).strip()
	if arg != '':
		port = int(arg)
	else:
		port = 8000
	
	monkey.patch_all()
	
	# connect to the database
	apibdb = getDB()
		
	# read the server model, generate call signatures and put it all in the database
	serverModel = {}
	apibdb.servermodel.remove()
	try:
		modelIn = open('server.model','r')
		model = json.loads(modelIn.read())
		modelIn.close()
	except IOError:
		print 'Error: Unable to read the server model'
		sys.exit(0)
	for i in range(len(model)):
		sig = model[i]['api']+'.'+model[i]['method']+'('+', '.join(map(str,model[i]['args']))+')'
		serverModel[sig] = model[i]
		model[i]['sig'] = sig
		apibdb.servermodel.insert(model[i])
	del model
	
	# start the request bot
	bot = Bot()
	bot.start()
	while not bot.running:
		pass
		
	Server(port=port, msgHandler=MsgHandler, exitHandler=None)
