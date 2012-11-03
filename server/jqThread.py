import threading
from Queue import Queue

class jqThread(threading.Thread):
	def __init__(self):
		self.running = False
		self.block = False
		self.jobs = Queue()
		threading.Thread.__init__ ( self )
	
	def new(self):
		if not self.block:
			job = jqJob()
			self.jobs.put(job)
			return job
	
	def stop(self):
		self.block = True
	
	def run(self):
		self.running = True
		while self.running:
			if self.jobs.empty():
				self.running = False
			else:
				job = self.jobs.get()
				job.execute()

class jqJob(object):
	def __init__(self):
		self.done = False
		self.expr = '.'
		self.data = '{}'
	
	def ex(self, expr):
		self.expr = expr
	
	def pipe(self, data):
		self.data = json.dumps(data)
	
	def execute(self):
		# run a job
		# where output?