import json

class Msg:
	def __init__(self, input):
		self.raw = input
		try:
			if 'cmd' in self.raw and 'cid' in self.raw and 'data' in self.raw:
				self.valid = True
				self.cmd = self.raw['cmd']
				self.cid = self.raw['cid']
				self.data = self.raw['data']
				self.length = len(self.text())
			else:
				self.valid = False
		except TypeError:
			print self.raw
	
	def text(self):
		return json.dumps(self.raw)
