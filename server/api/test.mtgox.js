var MtGox = require('./mtgox.js')['MtGox'];
var m = new MtGox(true);
//m.request('generic/private/info');	// returns information about your account, funds, fees, API privileges, withdraw limits . . .
//m.request('generic/private/idkey');	// Returns the idKey used to subscribe to a user's private updates channel in the websocket API. The key is valid for 24 hours.
//m.request('generic/private/orders');	// Returns information about your current open orders. Valid order statuses are: pending, executing, post-pending, open, stop, and invalid.
//m.currency('GBP', 'private/trades');	// Returns all of your trades in GBP. Does not include fees.
//m.currency('GBP','ticker');			// Ticker for GBP
//m.currency('PLN','ticker');			// Ticker for PLN
//m.currency('GBP','depth');			// Depth for GBP
//m.currency('PLN','depth');			// Depth for PLN
//m.currency('GBP','fulldepth');		// Full depth for GBP
//m.currency('PLN','fulldepth');		// Full depth for PLN
//m.currency('GBP','trades');			// Trades for GBP
//m.currency('PLN','trades');			// Trades for PLN
//m.currency('GBP','cancelledtrades');	// Cancelled trades for GBP
//m.currency('PLN','cancelledtrades');	// Cancelled trades for PLN