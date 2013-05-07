Python Class Diagrams
======


Bot(bool verboseRequests)
---------
	- (Logger) out
	- (DB) db
	- (array<Request>) jobs_active
	- (dict) requestModel
	- (dict<String:API>) api
	- (int) jobs_done
	- (bool) running

	- void log(string msg)
	- void run()
	- int pruneJobs()
	- void startJob(dict callObj)
	- void endJob(Request job)
	- void close()


Request(API requestObj, dict callObj, Logger out)
---------
	- (API) requestObj
	- (dict) callObj
	- (Logger) out
	- (dict) result
	- (bool) finished
	- (int) tStart
	- (int) tFinish

	- string __str__()
	- void log(string msg)
	- void run()
	- int ran()