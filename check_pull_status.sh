#!/bin/bash

git fetch -q origin;
export behind=$(git status -uno | grep -c "behind");

if [[ "$behind" == "1" ]]; then status="Not Up-To-Date"
else status="Already Up-To-Date"
fi

echo $status

if [[ "$status" == "Not Up-To-Date" ]]; then
  echo "Pulling..."
  git pull -q;
  echo "Pull Complete"
  if [[ "$1" == "build" ]]; then
    bash ./start_server.sh build
  fi
fi
