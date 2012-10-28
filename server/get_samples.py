from api import mtgox, intersango
from pprint import pformat

m = mtgox.mtgox()
i = intersango.intersango()

def save(result, file):
    f = open(file, 'w')
    f.write(pformat(result))
    f.close()

save(m.currency(7,'ticker'),			'samples/mtgoxGBPticker')
save(m.currency(7,'ticker'),			'samples/mtgoxGBPticker.json')
save(m.currency(7,'depth'),				'samples/mtgoxGBPdepth.json')
save(m.currency(7,'fulldepth'), 		'samples/mtgoxGBPfulldepth.json')
save(m.currency(7,'trades'), 			'samples/mtgoxGBPtrades.json')
save(m.currency(7,'cancelledtrades'), 	'samples/mtgoxGBPcancelled.json')
save(i.request_data('trades'), 			'samples/intersangoTrades.json')
save(i.request_data('depth'),			'samples/intersangoDepth.json')
save(i.request_data('ticker'), 			'samples/intersangoTicker.json')
