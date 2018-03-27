#!/bin/bash

export PORT=5108
export MIX_ENV=prod
export GIT_PATH=/home/playalgo/src/playalgo 

PWD=`pwd`
if [ $PWD != $GIT_PATH ]; then
	echo "Error: Must check out git repo to $GIT_PATH"
	echo "  Current directory is $PWD"
	exit 1
fi

if [ $USER != "playalgo" ]; then
	echo "Error: must run as user 'playalgo'"
	echo "  Current user is $USER"
	exit 2
fi

mix deps.get
(cd assets && npm install)
(cd assets && ./node_modules/brunch/bin/brunch b -p)
mix phx.digest
mix release --env=prod

mkdir -p ~/www
mkdir -p ~/old

NOW=`date +%s`
if [ -d ~/www/playalgo ]; then
	echo mv ~/www/playalgo ~/old/$NOW
	mv ~/www/playalgo ~/old/$NOW
fi

mkdir -p ~/www/playalgo
REL_TAR=~/src/playalgo/_build/prod/rel/playalgo/releases/0.0.1/playalgo.tar.gz
(cd ~/www/playalgo && tar xzvf $REL_TAR)

crontab - <<CRONTAB
@reboot bash /home/playalgo/src/playalgo/start.sh
CRONTAB

#. start.sh
