from httpBot import httpBot
from api import api

import json
import decimal
import re

class intersango(api):
	# Settings
	API_KEY	= {'api_key':'8a8aec137cb271d8f767dd7aca6e79b3'}
	LOGIN	= 'greg.balaga@gmail.com'
	PASS	= '82[fD650lh/2y57'
	VERSION	= '0.1'
	
	# Locations
	HOME	= 'https://intersango.com/'
	LOGINP	= HOME + 'login.php'
	API		= HOME + 'api/'
	APIAUTH	= API + 'authenticated/v' + VERSION + '/'
	
	SYMBOLS = [
	'BTC',
	'GBP',
	'EUR',
	'USD',
	'PLN']
	
	good_till_cancelled = 'gtc'
	fill_or_kill = 'fok'
	immediate_or_cancel = 'ioc'

	def request_auth(self,call_name,params={}):
		r = httpBot(self.APIAUTH + call_name + '.php', self.verbose)
		params.update(self.API_KEY)
		r.post = params
		if self.toUTF:
			return self.convert(json.loads(r.go()))
		else:
			return json.loads(r.go())
	
	# trades, depth, ticker
	def request_data(self, call_name, params={}):
		r = httpBot(self.API + call_name+'.php', self.verbose)
		r.get = params
		if self.toUTF:
			return self.convert(json.loads(r.go()))
		else:
			return json.loads(r.go())

	# get recommended price (non-API)
	def getRec(self, currency):
		# get csrf token
		r = httpBot(self.HOME, self.verbose)
		match = re.search('csrf_token" value="(.*?)"', r.go())
		self.csrf_token = match.group(1)
		
		# login
		r.setURL(self.LOGINP)
		r.post = [('login[email]',self.LOGIN),('login[password]',self.PASS),('csrf_token',self.csrf_token)]
		r.go()
		
		# get recommended price
		r.setURL(self.HOME + 'orderbook.php')
		r.get = {'currency_pair_id': currency}
		match = re.search('1 BTC = (\d+\.\d+)\s', r.go())
		return float(match.group(1))
	
	def list_accounts(self):
		return self.request_auth('listAccounts')
	
	def list_orders(self,account_id,last_order_id=None,states=None):
		params = {'account_id':account_id}
		
		if last_order_id is not None:
			params.update({'last_order_id': last_order_id})
		
		if states is not None:
			for state in states:
				params.append({'states[]': state})
		
		return self.request_auth('listOrders',params)
	
	def list_deposits(self,account_id):
		return self.request_auth('listDeposits', {'account_id': account_id})
	
	def list_withdrawal_requests(self,account_id):
		return self.request_auth('listWithdrawalRequests', {'account_id': account_id})
	
	def place_limit_order(self,quantity,rate,selling,base_account_id,quote_account_id,order_type=good_till_cancelled):
		assert type(quantity) == decimal.Decimal
		assert type(rate) == decimal.Decimal
		
		return self.request_auth('placeLimitOrder',{
		'quantity':quantity,
		'rate':rate,
		'selling':str(selling).lower(),
		'base_account_id':base_account_id,
		'quote_account_id':quote_account_id,
		'type':order_type})
	
	def request_cancel_order(self,account_id,order_id):
		return self.request_auth('requestCancelOrder', {'account_id': account_id, 'order_id': order_id})

#import pdb
#from pprint import pprint as pp
#i = intersango(True)
#pdb.set_trace()
#i.getRec()
#pp(i.list_accounts())
#pp(i.list_orders('211401404068'))
#pp(i.list_deposits('211401404068'))
#pp(i.list_withdrawal_requests('211401404068'))
#pp(i.request_data('trades'))
#pp(i.request_data('depth'))
#pp(i.request_data('ticker'))
