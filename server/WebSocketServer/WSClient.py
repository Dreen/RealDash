from time import time

from WebSocketServer.WSMsg import Msg
from WebSocketServer.Misc import Logger, IDCollisionWarning


# This class aggregates all clients currently connected to the server
class ClientPool:
	def __init__(self, db=None):
		self.clients = []
		self.db = db
	
	def add(self, client):
		self.clients.append(client)
	
	def remove(self, client):
		client.log("Removing from pool")
		try:
			self.clients.remove(client)
		except ValueError:
			client.log("... Failed, not in pool")
			return False
		else:
			return True
	
	def getById(self, id):
		for client in self.clients:
			if client.id == id:
				return client
		return False

		
class Client:
	def __init__(self, environ={}, serverModel={}, cPool=ClientPool(), db=None, msgHandler=None):
		# properties
		self.environ = environ
		self.id = None
		self.broadcastPaused = True # TODO unique
		
		# resources
		self.serverModel = serverModel
		self.msgHandler = msgHandler
		self.db = db
		self.model = []
		self.out = Logger()
		self.cPool = cPool
		self.channel = environ["wsgi.websocket"]
		
		self.log('Connected: %s (ID: %s)' % (self.environ['REMOTE_ADDR'], self.id))
	
	# def getID(len):
		# rzygi = ''
		# for i in range(len):
			# rzygi += str(hex(int(random() * 0x10000)))[2:]
		# return rzygi
	
	# update some client data in the db
	def updateDB(self, data={}):
		data['lastSeen'] = int(time())
		self.db.clients.update({'uid':self.id},{'$set':data})
		
	# read all client data from the db
	def readDB(self):
		self.updateDB()
		data = self.db.clients.find({'uid': self.id})
		if data.count() != 1:
			self.log('Possible ID collision')
			raise IDCollisionWarning(self.id)
		return data[0]
	
	def log(self, msg):
		if not self.out.closed:
			self.out.write(msg)
	
	# send data to the client
	def outbox(self, cmd, data):
		msgObj = Msg({'cid':self.id,'cmd':cmd,'data':data})
		msg = msgObj.text()
		if msgObj.valid:
			self.log('< ' + msg)
			self.channel.send(msg)
		else:
			self.log('ERROR: Invalid server-generated message: ' + msg)
				
	# process incoming data, if no handler is registered simply echo message back
	def inbox(self, msgObj):
		self.log('> ' + msgObj.text())
		if msgObj.valid:
			if self.msgHandler is not None:
				self.msgHandler(self, msgObj)
			else:
				self.outbox(msgObj.cmd, msgObj.data)
		else:
			self.invalidMsg(msgObj)
	
	def invalidMsg(self, msgObj):
		self.log('Invalid message: ' + msgObj.text())
		self.outbox('onError', 'Invalid client message')
		