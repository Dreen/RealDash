import json

class api():
	def __init__(self, verbose = False, toUTF = True, extCred = None):
		self.verbose = verbose
		self.toUTF = toUTF
		
		try:
			if extCred is None:
				credfile = open('api/cred/' + self.__class__.__name__ + '.cred','r')
			else:
				credfile = open(extCred,'r')
				
			if self.toUTF:
				self.cred = self.convert(json.loads(credfile.read()))
			else:
				self.cred = json.loads(credfile.read())
				
			credfile.close()
		except IOError:
			self.cred = {}
	
	# convert the result to JSON
	def getJSON(self, result):
		result = json.loads(result)
		if self.toUTF:
			return self.convert(result)
		else:
			return result
	
	# convert the resulting JSON from unicode to utf
	def convert(self, input):
		if isinstance(input, dict):
			return dict((self.convert(key), self.convert(value)) for key, value in input.iteritems())
		elif isinstance(input, list):
			return [self.convert(element) for element in input]
		elif isinstance(input, unicode):
			return input.encode('utf-8')
		else:
			return input