/*
 * A simple API used for testing purposes.
 */

module.exports = {
	getSimple: function()
	{
		return this.go({
			host: 'localhost',
			path: '/realdash-test-data/api.get.simple.php'
		});
	},

	postParam: function(foobar)
	{
		return this.go({
			host: 'localhost',
			path: '/realdash-test-data/api.get.simple.php'
		}, {
			foo: foobar
		});
	},

	getRandom: function()
	{
		return this.go({
			host: 'localhost',
			path: '/realdash-test-data/api.get.random.php'
		});
	}
};
