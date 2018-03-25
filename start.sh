#!/bin/bash

export PORT=5108

cd ~/www/playalgo
./bin/playalgo stop || true
./bin/playalgo start
