import threading
from time import time
import sys

from pymongo import DESCENDING

from WebSocketServer.Misc import Logger
from db import getDB

import pdb

# thread to gather data via APIs
class Bot(threading.Thread):
	def __init__(self, verboseRequests=False):
		# Resources
		self.out = Logger('logs/bot.log')
		self.log('Starting Bot thread')
		self.db = getDB()
		self.db.connection.start_request()
		self.jobs_active = []
		
		# Models / Load modules
		self.requestModel = self.db.servermodel.find()
		self.api = {}
		for call in self.requestModel:
			api = call['api']
			if api not in self.api:
				self.api[api] = None
				try:
					self.log('Importing '+api)
					__import__('api.'+api)
					self.api[api] = getattr(sys.modules['api.'+api], api)(verboseRequests)
				except ImportError:
					self.log('IMPORT ERROR: Missing API: '+api)
				except:
					self.log('IMPORT ERROR: Error importing API: '+api)
		self.log(str(len(self.api)) + ' API modules imported')
		
		# Status
		self.jobs_done = 0
		self.running = False
		
		# Remove any lingering unfinished jobs
		self.db.botjobs.remove({"finished":False})
		
		threading.Thread.__init__ ( self )
	
	def log(self, msg):
		if not self.out.closed:
			self.out.write(msg)
	
	def run(self):
		self.running = True
		while self.running:
			# loop through calls and make new requests for the ones that dont have active jobs AND should be called accoring to their timers
			started = 0
			self.requestModel.rewind()
			for call in self.requestModel:
				if self.db.botjobs.find({'sig': call['sig'], 'finished': False}).count() == 0: # if there are no unfinished (active) jobs for this call
					last = self.db.botjobs.find({'sig': call['sig'], 'finished': True}).sort('end', DESCENDING).limit(1) # get the last finished job
					if last.count(True) == 0 or ( int(time()) - call['timer'] > last[0]['start'] ): # if there are no finished job either, or the last job finished less than the appropiate time before now
						self.startJob(call)
						started += 1
			if started > 0:
				self.log('Started '+str(started) + ' jobs')
			
			pruned = self.pruneJobs()
			if pruned > 0:
				self.log('Pruned '+str(pruned) + ' jobs')
			if started > 0 or pruned > 0:
				self.log('Active jobs: ' + str(len(self.jobs_active)))
			
			# remove jobs older than 30 minutes # TODO dev
			self.db.botjobs.remove({'end':{'$lt': (int(time()) - 60*30)}})
	
	# loop through active jobs and remove the finished ones + mark them finished in DB
	def pruneJobs(self):
		pruned = 0  # temp
		jobs_active_new = []
		for job in self.jobs_active:
			if job.finished:
				self.endJob(job)
				self.jobs_done += 1
				pruned += 1  # temp
			else:
				jobs_active_new.append(job)
		self.jobs_active = jobs_active_new
		return pruned
	
	# start a new job
	def startJob(self, callObj):
		self.log('Starting: ' + callObj['sig'])
		job = Request(self.api[callObj['api']], callObj, self.out)
		self.db.botjobs.insert({
			"sig" : callObj['sig'],
			"finished" : False,
			"start": int(time()),
			"end": 0,
			"exectime": 0,
			"result": {}})
		job.start()
		self.jobs_active.append(job)
	
	# end a finished job
	def endJob(self, job):
		self.log('Finished: ' + job.callObj['sig'])
		self.db.botjobs.update({
			'sig': job.callObj['sig'],
			'finished': False},
			{'$set': {
				'end': int(time()),
				'result': job.result,
				'finished': True,
				"exectime": job.ran()
				}
			})
	
	def close(self):
		self.log('Shutting down the bot. Waiting for requests to finish...')
		self.running = False
		
		# wait for the requests to be completed
		while len(self.jobs_active) > 0:
			self.pruneJobs()
		
		self.db.connection.end_request()
		self.log('Closing')
		self.out.close()

# a thread for a single request
class Request(threading.Thread):
	def __init__(self, requestObj, callObj, out):
		self.requestObj = requestObj
		self.callObj = callObj
		self.out = out
		self.result = None
		self.finished = False
		self.tStart = 0
		self.tFinish = 0
		
		threading.Thread.__init__ ( self )
		
	def __str__(self):
		return self.requestObj.__module__ + '.' + self.callObj['method'] + '(' + ','.join(map(str,self.callObj['args'])) + ')'
	
	def log(self, msg):
		if not self.out.closed:
			self.out.write(msg)
			
	def run(self):
		self.tStart = time()
		try:
			self.result = getattr(self.requestObj, self.callObj['method'])(*self.callObj['args'])
		except:
			e = sys.exc_info()
			self.log('Error processing API request: %s: %s' % (str(self), e[1][1]))
		self.finished = True
		self.tFinish = time()
	
	def ran(self):
		return int((self.tFinish - self.tStart) * 1000)
		