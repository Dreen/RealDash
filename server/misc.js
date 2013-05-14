var _values	= require('underscore').values,
_without	= require('underscore').without;


exports.concrete = function(arr)
{
	return (_without(_values(arr), undefined).length > 0);
}
