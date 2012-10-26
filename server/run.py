import sys
from pymongo import *

from WebSocketServer.WSServer import Server
from RequestBot import Bot
from Handlers import *

if __name__ == "__main__":
	arg = ''.join(sys.argv[1:]).strip()
	if arg != '':
		port = int(arg)
	else:
		port = 8000
	
	apibdb = None
	try:
		conn = Connection()
		apibdb = conn['apib']
	except ConnectionFailure, InvalidName:
		print 'Cannot connect to the database.'
		sys.exit(0)
	
	# self.bot = Bot(self.serverModel)
	# self.bot.start()
	# while self.bot.res['request_time'] == 0:
		# pass
		
	Server(port=port, bot=None, db=apibdb, msgHandler=MsgHandler, exitHandler=None)
