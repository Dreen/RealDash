#!/bin/bash

basepath="$( cd "$( dirname "$0" )" && pwd )"

echo "Shutting down the server..."
kill -2 `cat "$basepath/server_pid"`
rm "$basepath/server_pid"
rm "$basepath/client/address"

echo "Archiving logs..."
today=$(date +%Y-%m-%d)
mkdir -p "$basepath/server/logs/archive/$today"
find "$basepath/server/logs/" -maxdepth 1 -name '*.log' | while read logfile;
do
	logfile=$(basename $logfile)
	cat "$basepath/server/logs/$logfile" >> "$basepath/server/logs/archive/$today/$logfile"
	rm "$basepath/server/logs/$logfile"
done