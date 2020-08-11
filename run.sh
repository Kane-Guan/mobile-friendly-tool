#!/usr/bin/env bash

key=$1
total=$2
count=`expr $total / $3`
start=0
for i in $(seq 0 `expr $3 - 1`); 
do
  echo "Run sitemap from $start to `expr $start + $count`"
  # touch ./nohup_output/log_${start}
  echo "nohup node index.js $1 $start $count > ./nohup_output/log_${start} 2>&1 &" | bash
  start=`expr $start + $count`
done