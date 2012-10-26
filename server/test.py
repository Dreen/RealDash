from bot import Bot
from pprint import pprint as pp
import pdb
import signal
import sys

pdb.set_trace()




APIModel = ['mtgox','intersango']
requestModel = {'mtgox/currency/11/ticker': {'api': 'mtgox', 'method': 'currency', 'args': [11, 'ticker']},
				'intersango/request_data/ticker': {'api': 'intersango', 'method': 'request_data', 'args': ['ticker']},
				'intersango/request_data/depth': {'api': 'intersango', 'method': 'request_data', 'args': ['depth']},
				'mtgox/currency/7/depth': {'api': 'mtgox', 'method': 'currency', 'args': [7, 'depth']},
				'mtgox/currency/7/ticker': {'api': 'mtgox', 'method': 'currency', 'args': [11, 'ticker']},
				'mtgox/currency/11/depth': {'api': 'mtgox', 'method': 'currency', 'args': [11, 'depth']}}

bot = Bot(APIModel, requestModel, verbose=True)
bot.start()
while bot.res['request_time'] == 0:
	pass





def shutdown_handler(signal, frame):
	global bot
	bot.close()
	while bot.isAlive():
		pass
	sys.exit(0)
signal.signal(signal.SIGINT, shutdown_handler)

while True:
	pass
