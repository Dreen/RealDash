var
_isObj   = require('underscore').isObject;

function e404(res)
{
        res.status(404).send('{}');
}

module.exports = function(app, db)
{
        app.get('/model/:name/:call?', function(req, res)
        {
                var model = db.collection('model');
                model.find({
                        'name': req.params.name
                }).toArray(function(err, data)
                {
                        if (data.length === 1 && _isObj(data[0]))
                        {
                                if (typeof req.params.call == "undefined")
                                {
                                        res.status(200).json(data[0]);
                                }
                                else
                                {
                                        // TODO: request a call by signature
                                        var callNum = parseInt(req.params.call);
                                        if (!isNaN(callNum) && _isObj(data[0].calls[callNum]))
                                        {
                                                res.status(200).json(data[0].calls[callNum]);
                                        }
                                        else
                                        {
                                                e404(res);
                                        }
                                }
                        }
                        else
                        {
                                e404(res);
                        }
                });
        });
};