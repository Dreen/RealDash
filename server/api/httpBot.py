import pycurl
import StringIO
import json
from urllib import urlencode
from time import strftime, localtime, time

from WebSocketServer.Misc import Logger

class httpBot:
	
	# set some options
	def __init__(self, initUrl = '', verbose = False):
		self.curl = pycurl.Curl()
		self.cookies = {}
		self.url  = ""
		self.ua   = "Mozilla/5.0 (X11; Linux i686; rv:10.0) Gecko/20100101 Firefox/10.0"
		self.code = 0
		self.verbose = verbose
		
		if self.verbose:
			self.curlmap = {}
			mapin = open('curlopt_map.json','r')
			map = json.loads(mapin.read())
			for e in map:
				self.curlmap[int(e)] = map[e]
			mapin.close()
		
		if self.verbose:
			self.log = Logger('logs/httpBot.'+str(time())+'.log', levels={1:' <- ', 2:' -> '})
			self.option([
			(pycurl.VERBOSE		, True				), # Debugging requires verbosity
			(pycurl.DEBUGFUNCTION,self.debug		)])# Pass debugging information
					
		self.option([
		(pycurl.HEADERFUNCTION	, self.getHead		), # store headers here
		(pycurl.FOLLOWLOCATION	, True				), # follow redirects
		(pycurl.ENCODING      	, ""				), # handle all encodings
		(pycurl.USERAGENT     	, self.ua			), # who am i
		(pycurl.AUTOREFERER   	, True				), # set referer on redirect
		(pycurl.CONNECTTIMEOUT	, 120				), # timeout on connect
		(pycurl.TIMEOUT       	, 120				), # timeout on response
		(pycurl.MAXREDIRS     	, 100				)])# allow redirects
		
		self.setURL(initUrl.encode('ascii'))
	
	# free resources
	def __del__(self):
		del self.log
		self.curl.close()
		del self.curl
	
	# print debug messages
	def debug(self, debug_type, debug_msg):
		if self.verbose:
			self.log.write(debug_msg, debug_type)
	
	# convert headers from a string to a dict, parse cookies
	def getHead(self, buf):
		head = buf.split('\r\n')
		for h in head:
			h = h.split(': ',1)
			if len(h) > 1:
				self.dHead.update(dict([h]))
			if h[0] == 'Set-Cookie':								# TODO there seems to still be some issues with parsing cookies, ex google.com
				self.cookies.update(dict([h[1].split(';',1)[0].split('=',1)]))
	
	# set a cURL option
	def option(self, name, val = None):
		if val is None and type(name) is list:
			for o in name:
				self.option(o[0], o[1])
		else:
			if self.verbose:
				try:
					self.debug(2, 'SETOPT ('+self.curlmap[name]+', ('+type(val).__name__+')'+json.dumps(val)+')')
				except TypeError:
					self.debug(2, 'SETOPT ('+self.curlmap[name]+', <'+type(val).__name__+'>)')
			self.curl.setopt(name, val)
	
	# set the URL
	def setURL(self, url, resetData = True):
		self.url = url
		self.option(pycurl.URL, url)
		
		# reset some local data
		if resetData:
			self.post = {}
			self.get  = {}
			self.dHead= {}
			self.uHead= {}
	
	# send the request and return the response
	def go(self):
		# set request headers
		self.uHead.update({'Expect':''}) # deal with HTTP 417 Expectation Failed
		cookie = ''
		for c in self.cookies:
			cookie += c + '=' + self.cookies[c] + '; '
		self.uHead.update({'Cookie': cookie})
		head = []
		for h in self.uHead:
			head.append(h+': '+self.uHead[h])
		self.option(pycurl.HTTPHEADER, head)
		self.debug(2, '\r\n'.join(head))
			
		# add POST fields
		if len(self.post) > 0:
			encpost = urlencode(self.post)
			self.option([
			(pycurl.POST		, 1			), # Enable POST
			(pycurl.POSTFIELDS	, encpost	)])# Set POST fields
			self.debug(2, "POST data: " + encpost)
		
		# add GET fields
		if len(self.get) > 0:
			encget = urlencode(self.get)
			self.setURL(self.url + '?' + encget, False)
			self.debug(2, "GET data: " + encget)
		
		out = StringIO.StringIO()
		self.option(pycurl.WRITEFUNCTION, out.write)
		self.curl.perform()
		self.code = self.curl.getinfo(pycurl.HTTP_CODE)
		
		return out.getvalue()
