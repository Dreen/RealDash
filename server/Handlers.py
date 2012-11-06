def MsgHandler(self, msgObj):
	# authentication
	if msgObj.cmd == 'Auth':
		self.id = msgObj.cid
		try:
			data = self.readDB()
		except IDCollisionWarning:
			self.id = None
			
		if self.id is None or data['lastip'] != self.environ['REMOTE_ADDR']:
			self.id = None
			self.log('Authentication error')
			self.outbox('onError', 'Authentication error')
		else:
			# move the log into the file
			self.out.realize('logs/' + self.id + '.log')
			self.log('Authenticated with ID: ' + self.id)
			
			# as a greeting send the server model
			self.outbox('ServerModel', self.serverModel)
			
			# restore the saved client model to memory
			self.model = data['savedModel']
	
	# do not allow other commands for un-authenticated clients
	elif self.id is None:
		self.outbox('onError', 'Command not allowed: Client is not authenticated.')
	
	# starting / stopping the live stream
	elif msgObj.cmd == 'Status':
		if msgObj.data == 'Start':
			self.log('Starting the stream')
			self.broadcastPaused = False
		elif msgObj.data == 'Stop':
			self.log('Stopping the stream.')
			self.broadcastPaused = True
	
	# client requesting a saved client model (if any)
	elif msgObj.cmd == 'GetSavedCM':
		# this is not read from db because it should be current, update like this if necessary:
		# self.model = self.db.clients.find({'uid':self.id})[0]['savedModel']
		self.outbox('SavedCM', self.model)
	
	# saving a client model for the client
	elif msgObj.cmd == 'SaveCM':
		self.model = msgObj.data
		self.updateDB({'savedModel':self.model})
		self.log('Client Model saved on the server.')
	
	# erasing the saved client model
	elif msgObj.cmd == 'DeleteCM':
		self.model = []
		self.updateDB({'savedModel':self.model})
		self.log('Client Model erased.')
	
	else:
		self.invalidMsg(msgObj)

def ExitHandler(self):
	self.db.connection.disconnect()
	self.bot.close()
	while bot.isAlive():
		pass
