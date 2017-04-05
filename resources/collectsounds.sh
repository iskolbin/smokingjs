#!/bin/bash

pushd sounds
audiosprite -o "sounds" -e "mp3,ogg" -f "howler" -g 0.5 -b 56 -v 9 *
mv sounds* ../../app/assets

