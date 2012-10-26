import threading
from time import time

# thread to keep broadcasting messages from the request bot to all clients
class BroadcastThread(threading.Thread):
	def __init__(self, cPool, bot, frequency=5):
		self.lastUpdate = 0
		self.frequency = frequency
		self.cPool = cPool
		self.bot = bot
		self.running = True
		threading.Thread.__init__ ( self )
	
	def close(self):
		self.running = False
	
	def run(self):
		while self.running:
			t = int(time())
			if t - self.frequency > self.lastUpdate and self.bot.res['request_time'] > 1 and len(self.cPool) > 0:
				for client in self.cPool:
					if not client.broadcastPaused:
						client.outbox('loadJSON', self.bot.res)
				self.lastUpdate = t
