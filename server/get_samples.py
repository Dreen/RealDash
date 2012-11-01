from api import mtgox, intersango
from pprint import pformat
import re

m = mtgox.mtgox()
i = intersango.intersango()
pt_escape = re.compile(r'\\x[0-9a-f]{2}')

def save(result, file):
	f = open(file, 'w')
	resultStr = pformat(result).replace("'",'"').replace(': None',': null')
	resultStr = pt_escape.sub('', resultStr)
	f.write(resultStr)
	f.close()

save(m.currency(7,'ticker'),			'samples/mtgoxGBPticker.json')
save(m.currency(7,'depth'),				'samples/mtgoxGBPdepth.json')
save(m.currency(7,'fulldepth'), 		'samples/mtgoxGBPfulldepth.json')
save(m.currency(7,'trades'), 			'samples/mtgoxGBPtrades.json')
save(m.currency(7,'cancelledtrades'), 	'samples/mtgoxGBPcancelled.json')
save(i.request_data('trades'), 			'samples/intersangoTrades.json')
save(i.request_data('depth'),			'samples/intersangoDepth.json')
save(i.request_data('ticker'), 			'samples/intersangoTicker.json')
