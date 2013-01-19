from pymongo import *
from sys import exit

def getDB():
	apibdb = None
	try:
		conn = Connection()
		apibdb = conn['apib']
	except ConnectionFailure, InvalidName:
		print 'Cannot connect to the database.'
		exit(0)
	return apibdb