var
assert	= require('assert'),
Msg = require('../msg.js');

describe('Message', function()
{
	describe('valid', function()
	{
		var o = {
			"cid": "ABC",
			"cmd": "test"
		};
		var s = '{"cid":"ABC","cmd":"test"}';
		
		it('from json', function()
		{
			var msg = new Msg(o);
			assert.ok(msg.isValid);
			assert.deepEqual(msg.toJSON(), o);
			assert.equal(msg.toString(), s);
			assert.equal(msg.getCid(), "ABC");
			assert.equal(msg.getCmd(), "test");
			assert.deepEqual(msg.getArgs(), []);
		});
		
		it('from string', function()
		{
			var msg = new Msg(s);
			assert.ok(msg.isValid);
			assert.deepEqual(msg.toJSON(), o);
			assert.equal(msg.toString(), s);
			assert.equal(msg.getCid(), "ABC");
			assert.equal(msg.getCmd(), "test");
			assert.deepEqual(msg.getArgs(), []);
		});
	});

	describe('invalid', function()
	{
		var o = {
			"cmd": "test"
		};
		var s = '{"cmd": "test"}';
		
		it('from json', function()
		{
			var msg = new Msg(o);
			assert.ok(!msg.isValid);
		});
		
		it('from string', function()
		{
			var msg = new Msg(s);
			assert.ok(!msg.isValid);
		});
	});

	describe('with arguments', function()
	{
		var o = {
			"cid": "ABC",
			"cmd": "test",
			"args": [1, 2, 3]
		};
		var s = '{"cid":"ABC","cmd":"test","args":[1, 2, 3]}';

		it('from json', function()
		{
			var msg = new Msg(o);
			assert.ok(msg.isValid);
			assert.equal(msg.getArgs(1), 2);
		});
		
		it('from string', function()
		{
			var msg = new Msg(s);
			assert.ok(msg.isValid);
			assert.equal(msg.getArgs(2), 3);
		});
	});
});