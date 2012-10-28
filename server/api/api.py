class api(object):

	def __init__(self, verbose = False, toUTF = True):
		self.verbose = verbose
		self.toUTF = toUTF
		
	
	def convert(self, input):
		if isinstance(input, dict):
			return dict((self.convert(key), self.convert(value)) for key, value in input.iteritems())
		elif isinstance(input, list):
			return [self.convert(element) for element in input]
		elif isinstance(input, unicode):
			return input.encode('utf-8')
		else:
			return input