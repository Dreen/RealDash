import threading
from time import time
import sys

from WebSocketServer.Misc import Logger

# thread to gather data via APIs
class Bot(threading.Thread):
	def __init__(self, requestModel, updateInterval=15, verboseRequests=False):
		# Resources
		self.res = {'request_time':0}
		self.out = Logger('logs/bot.log')
		
		# Models
		self.requestModel = requestModel
		self.api = {}
		for m in self.requestModel:
			api = self.requestModel[m]['api']
			if api not in self.api:
				self.api[api] = None
				try:
					__import__('api.'+api)
					self.api[api] = getattr(sys.modules['api.'+api], api)(verboseRequests)
				except ImportError:
					self.log('IMPORT ERROR: Missing API: '+api)
		
		# Settings
		self.updateInterval = updateInterval
		#self.valuePrecision = valuePrecision
		
		# Status
		self.updates = 0
		self.running = True
		self.updating = False
		
		self.log('Starting Bot thread')
		threading.Thread.__init__ ( self )
	
	def log(self, msg):
		if not self.out.closed:
			self.out.write(msg)
	
	def close(self):
		self.log('Shutting down the bot. Waiting for requests to finish...')
		self.running = False
		self.waitForAllRequests()
		self.log('Closing')
		self.out.close()
	
	# wait for the requests to be completed and return their count
	def waitForAllRequests(self):
		total = len(self.requests)
		while True:
			completed = 0
			for r in self.requests:
				if self.requests[r].result is not None:
					completed += 1
			if completed == total:
				break
		return total
	
	def run(self):
		self.res['request_time'] = 1
		while self.running:
			t = int(time())
			if t - self.updateInterval > self.res['request_time']: # TODO individual timers
				# prepare and start requests
				res = {'request_time':t} #, "int_gbp": [], "int_pln": [], "int_rat": [], "mtg_gbp": [], "mtg_pln": [], "mtg_rat": [], "img": [], "mgi": []}
				self.requests = {}
				for r in self.requestModel:
					self.requests[r] = Request(self.api[self.requestModel[r]['api']],self.requestModel[r]['method'],self.requestModel[r]['args'])
					self.log('Starting request '+r)
					self.requests[r].start()
				
				total = self.waitForAllRequests()
				self.log("Completed %d requests in %d seconds." % (total, int(time())-t))
				
				# collect results
				for r in self.requests:
					res[r] = self.requests[r].result
				self.res = res
				self.updates += 1

# a thread for a single request
class Request(threading.Thread):
	def __init__(self, requestObj, method, args):
		self.requestObj = requestObj
		self.method = method
		self.args = args
		self.result = None
		
		threading.Thread.__init__ ( self )
	
	def run(self):
		self.result = getattr(self.requestObj, self.method)(*self.args)
