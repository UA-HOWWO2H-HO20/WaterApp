#!/bin/bash
HOME="/home/floviz"
if [ $# -eq 0  ]; then
cd $HOME/build
npm start

elif [[ "$1" == "build" ]]; then
rm -rf $HOME/build/*
cp -r ./water-app/* ~/build
rm $HOME/build/README.md
cd $HOME/build
echo "Building Before Execution..."
echo "This will take a minute"
d=$(date +"%Y-%m-%d--%H:%M:%S")
d+=".log"
mkdir -p ./log
#touch "$d" && npm install --force &>./log/$(echo $d) && echo "Starting..." && npm start
touch "$d" && npm install --force && echo "Starting..." && npm start
fi
