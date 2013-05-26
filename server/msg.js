var
_isArray = require('underscore').isArray,
_isObj	 = require('underscore').isObject,
_isUndef = require('underscore').isUndefined;

function Msg(data)
{
	if (typeof data == 'string')
	{
		this._data = JSON.parse(data);
		this._str = data;
	}
	else
	{
		this._data = data;
		this._str = JSON.stringify(data);
	}
	this.isValid = _isObj(this._data) &&
			'cid' in this._data && 'cmd' in this._data &&
			(_isUndef(this._data['args']) || _isArray(this._data['args']));
}

Msg.prototype.toJSON = function()
{
	return this._data;
}

Msg.prototype.toString = function()
{
	return this._str;
}

Msg.prototype.getCid = function()
{
	return this._data['cid'] || null;
}

Msg.prototype.getCmd = function()
{
	return this._data['cmd'] || null;
}

Msg.prototype.getArgs = function(i)
{
	return (typeof i == "number" && i >= 0) ? (this._data['args'][i] || null) : (this._data['args'] || []);
}

module.exports = Msg;