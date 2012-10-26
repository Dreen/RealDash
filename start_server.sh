#!/bin/bash

basepath="$( cd "$( dirname "$0" )" && pwd )"

public_dns=$(curl -s http://169.254.169.254/latest/meta-data/public-hostname)
echo $public_dns > "$basepath/client/address"

cd "$basepath/server"
python "run.py" &
echo $! > "$basepath/server_pid"
echo "Server running"
