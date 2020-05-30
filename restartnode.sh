#!/bin/sh
#Restart Denarius Node
denarius.daemon stop
sleep 120
denarius.daemon
#Wait 120 seconds for wallet to sync and come online
sleep 120