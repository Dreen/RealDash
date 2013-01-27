var MtGox = require('./mtgox.js')['MtGox'];
var m = new MtGox(true);
m.request('BTCGBP/public/ticker');
