/*
 * A simple API used for testing purposes.
 */

module.exports = {
	getSimple: function()
	{
		return this.go({
			'host': 'ec2-54-245-170-7.us-west-2.compute.amazonaws.com',
			'path': '/~ec2-user/data/api.get.simple.php'
		});
	},

	postParam: function(foobar)
	{
		return this.go({
			'host': 'ec2-54-245-170-7.us-west-2.compute.amazonaws.com',
			'path': '/~ec2-user/data/api.post.param.php'
		}, {
			'foo': foobar
		});
	}
};
