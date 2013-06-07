var
_isArray = require('underscore').isArray,
_isObj   = require('underscore').isObject;

function e404(res)
{
        res.status(404).send('{}');
}

module.exports = function(app, db)
{
        // app.get('/info') // TODO


        /*
         * Gets Model information identified by API name.
         * If call is specified, gets only information about specific call
         * returns an object
         */
        app.get('/model/:name/:call?', function(req, res)
        {
                var model = db.collection('model');
                model.find({
                        'name': req.params.name
                }).toArray(function(err, data)
                {
                        if (data.length === 1 && _isObj(data[0]))
                        {
                                // the whole model
                                if (typeof req.params.call == "undefined")
                                {
                                        res.status(200).json(data[0]);
                                }
                                // specific call
                                else
                                {
                                        // TODO: request a call by signature
                                        var callNum = parseInt(req.params.call);
                                        if (!isNaN(callNum) && _isObj(data[0].calls[callNum]))
                                        {
                                                res.status(200).json(data[0].calls[callNum]);
                                        }
                                        else e404(res);
                                }
                        }
                        else e404(res);
                });
        });

        /*
         * Gets Request Jobs information identified by a call signature.
         * start is mandatory and information is returned for the job(s) that started after or at the specified time in ms.
         * start_end is optional, if present, returns a list of jobs that started in the specified interval. if absent, only a single job is returned.
         * returns an object for a single job or an array for a list of jobs
         */
        app.get('/jobs_req/:sig/:start/:start_end?', function(req, res)
        {
                // input params
                var
                sig = req.params.sig,
                start = parseInt(req.params.start),
                start_end = parseInt(req.params.start_end);
                if (!sig || isNaN(start))
                {
                        e404(res);
                        return;
                }

                // query params
                var
                jobs_req = db.collection('jobs_req'),
                findSpec = {
                        'sig': sig,
                        'start' : {$gte: start}
                },
                findMethod = 'findOne';

                // optional query params
                if (!isNaN(start_end))
                {
                        findSpec['start'] = {
                                $and: [
                                        {$gte: start},
                                        {$lte: start_end}
                                ]
                        };
                        findMethod = 'find';
                }

                jobs_req[findMethod](findSpec).toArray(function(err, data)
                {
                        if (data.length == 1 && _isObj(data[0]))
                        {
                                res.status(200).json(data[0]);
                        }
                        else if (data.length > 0)
                        {
                                res.status(200).json(data);
                        }
                        else e404(res);
                });
        });
};