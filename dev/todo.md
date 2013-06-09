 - mongo indexes

	server/broadcast.js
	39:								user.outbox('jobinfo', [newJobs[j]]); // TODO what do we want to send here

	server/rest.js
	12:        // app.get('/info') // TODO
	37:                                        // TODO: request a call by signature

	server/users.js
	24:			console.log('Pooling %s ID %s', newuser ? 'new' : 'old', socket.id); // TODO remove when we test with interface
	38:				model : { // TODO: change this to empty array when we get an interface

	server/main.js
	20:err_handler = function(){}; //TODO

	server/bot.js
	123:			var modulePath = './api/' + mirror._requestModel[apiName]['file']; // TODO this is relative to server/, should be made absolute with a global base path
	145:	// cleanup, remove unfinished entries in the db // TODO

	server/user.js
	81:		// TODO: process message