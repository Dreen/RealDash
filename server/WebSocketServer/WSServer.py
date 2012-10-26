import sys
import signal
import json

from gevent import signal as gsignal
from gevent.pywsgi import WSGIServer
import geventwebsocket

from WebSocketServer.WSClient import *
from WebSocketServer.WSMsg import Msg
from WebSocketServer.WSBroadcast import BroadcastThread
from WebSocketServer.Misc import Logger

# TODO wsgi multithreaded?

import pdb

class Server(object):
	# start the server
	def __init__(self, port=8000, bot=None, db=None, msgHandler=None, exitHandler=None):
		self.out = Logger('logs/server.log')
		self.server_port = port
		self.log('Serving at port ' + str(self.server_port))
		self.bot = bot
		self.db = db
		self.msgHandler = msgHandler
		self.exitHandler = exitHandler
		
		try:
			modelIn = open('server.model','r')
			self.serverModel = json.loads(modelIn.read())
			modelIn.close()
		except IOError:
			print 'Error: Unable to read the server model'
			exit()
		
		self.cPool = ClientPool(self.db)
		
		#self.broadcast = BroadcastThread(self.cPool, self.bot)
		#self.broadcast.start()
		
		self.server = WSGIServer(("", self.server_port), self.serve, handler_class=geventwebsocket.WebSocketHandler, log=self.out)
		gsignal(signal.SIGTERM, self.shutdown)
		gsignal(signal.SIGQUIT, self.shutdown)
		gsignal(signal.SIGINT,  self.shutdown)
		self.server.serve_forever()

	def log(self, msg):
		if not self.out.closed:
			self.out.write(msg)
	
	# shutdown the server
	def shutdown(self):
		self.log('Shutting down')
		if self.exitHandler is not None:
			self.exitHandler(self)
		self.server.stop()
		sys.exit(0)
	
	# request handler
	def serve(self, environ, start_response):
		websocket = environ.get("wsgi.websocket")
		if websocket is None:
			start_response("400 Bad Request", [])
			return ["400 Bad Request"]
		try:
			# setup connection
			client = Client(environ=environ, serverModel=self.serverModel, cPool=self.cPool, db=self.db, msgHandler=self.msgHandler)
			self.cPool.add(client)
			self.log('New connection from IP: %s Origin: %s;' % (environ['REMOTE_ADDR'], environ['HTTP_ORIGIN']))
			
			# handle messages
			while True:
				raw_message = websocket.receive()
				if raw_message is None:
					break
				try:
					msg = Msg(json.loads(raw_message))
				except ValueError:
					client.log('ERROR: Unparsable client message: ' + raw_message)
				else:
					client.inbox(msg)
			
			# close connection
			client.log('Disconnected')
			self.cPool.remove(client)
			websocket.close()
			self.log('Disconnected client %s (IP: %s)' % (client.id, environ['REMOTE_ADDR']))
			del client
		except geventwebsocket.WebSocketError, ex:
			print "%s: %s" % (ex.__class__.__name__, ex)

