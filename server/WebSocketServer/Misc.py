from time import strftime, localtime
from StringIO import StringIO

class IDCollisionWarning(Warning):
	def __init__(self, id):
		Warning.__init__(self)
		serverout = Logger('logs/server.log', append=True)
		serverout.write('WARNING: Possible ID collision: ' + id)
		serverout.close()

class Logger(object):
	def __init__(self, filename=None, levels=None, timestamped=True, append=False):
		if filename is None:
			self.log = StringIO()
			self.closed = False
		else:
			if append:
				mode = 'a'
			else:
				mode = 'w'
			self.log = open(filename, "w")
			self.closed = self.log.closed
		self.timestamped = timestamped
		if levels is not None:
			self.levels = levels
		else:
			self.levels = False
	
	# if the class was initialised with a null filename, the logs are being written to a buffer. this function moves the buffer into a real file.
	def realize(self, filename):
		if not isinstance(self.log, StringIO):
			return
		buf = self.log.getvalue()
		self.log.close()
		self.log = open(filename, "w")
		self.closed = self.log.closed
		self.log.write(buf)
	
	def close(self):
		self.closed = True
		self.log.close()
		
	def write(self, msg, level=None):
		try:
			msg = msg.strip().encode('utf-8').split('\n')
		except UnicodeDecodeError:
			msg = msg.strip().split('\n')
		
		if len(msg) > 1:
			for m in msg:
				self.write(m, level)
		elif len(msg[0].strip()) > 0:
			if self.timestamped:
				timestamp = strftime("[%H:%M:%S] ", localtime())
			else:
				timestamp = ''
			
			if self.levels is not False and isinstance(self.levels, dict) and level in self.levels.keys():
				self.log.write(timestamp + self.levels[level] + msg[0] + "\n")
			elif (self.levels is not False and isinstance(self.levels, list) and level in self.levels) or self.levels is False:
				self.log.write(timestamp + msg[0] + "\n")
			
			self.log.flush()