Python Class Diagrams
======

Bot
---------
	Bot (bool verboseRequests)
	Logger out
	DB db
	array<Request> jobs_active
	dict requestModel
	dict<string:API> api
	int jobs_done
	bool running

	void log(string msg)
	void run()
	int pruneJobs()
	void startJob(dict callObj)
	void endJob(Request job)
	void close()

Request
---------
	Request (API requestObj, dict callObj, Logger out)
	API requestObj
	Logger out
	dict callObj
	dict result
	bool finished
	time tStart
	time tFinish

	string __str__()
	void log(string msg)
	void run()
	int ran()

Broadcast
---------
	Broadcast (ClientPool cPool)
	ClientPool cPool
	DB db
	bool running
	int lastUpdate
	
	void close()
	void run()

ClientPool
--------
	ClientPool ()
	array<Client> clients
	
	void add(Client client)
	bool remove(Client client)
	Client getById(string id)

Client
--------
	Client(dict environ, ClientPool cPool, function msgHandler)
	ClientPool cPool
	DB db
	Socket channel
	Logger out
	dict environ
	string id
	bool broadcastPaused
	dict serverModel
	array model
	array dataModel
	
	(function msgHandler)
	void updateDB(dict data)
	dict readDB()
	void log(string msg)
	void outbox(string cmd, dict data)
	void inbox(Msg msgObj)
	void invalidMsg(Msg msgObj)
	
Msg
--------
	Msg(dict input)
	dict raw
	bool valid
	string cmd
	string cid
	dict data
	int length
	
	string text()
	
	
	
