#!/bin/bash

count=0

while true
do
    ((count++))
    echo "Request $count"
    http GET :3000
    sleep 1
done
