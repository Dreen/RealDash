import threading
from time import time
from db import getDB

# thread to keep broadcasting messages from the request bot to all clients
class BroadcastThread(threading.Thread):
	def __init__(self, cPool):
		self.running = False
		self.lastUpdate = 0
		self.cPool = cPool
		self.db = getDB()
		self.db.connection.start_request()
		#self.requestModel = self.db.servermodel.find()
		
		threading.Thread.__init__ ( self )
	
	def close(self):
		self.db.connection.end_request()
		self.running = False
	
	def run(self):
		self.running = True
		while self.running:
			# get last 10 minutes of requests
			last10min = self.db.botjobs.find({'end':{'$gt': (int(time()) - 600)}})
			# loop through all clients
			for client in self.cPool.clients:
				# if client accepts broadcasting
				if not client.broadcastPaused:
					# check if client already has this job in his data model
					for job in last10min:
						if job not in client.dataModel:
							client.dataModel.append(job)
							# if not, check if he has the call in the request model and send it
							# try:
							if job['sig'] in client.model:
								job['_id'] = str(job['_id'])
								client.outbox('JobInfo', job)
							# except NotImplementedError: # TODO oh dear...
								# pass
			
			# t = int(time())
			# if t - self.frequency > self.lastUpdate and self.bot.res['request_time'] > 1 and len(self.cPool) > 0:
				# for client in self.cPool:
					# if not client.broadcastPaused:
						# client.outbox('loadJSON', self.bot.res)
				# self.lastUpdate = t
