#!/bin/bash
MY_PATH="`dirname \"$0\"`"              # relative
MY_PATH="`( cd \"$MY_PATH\" && pwd )`"  # absolutized and normalized
cd "$MY_PATH" || exit

cd types || exit
rm -f package-lock.json

cd ../log || exit
rm -f package-lock.json

cd ../interfaces || exit
rm -f package-lock.json

cd ../data || exit
rm -f package-lock.json

cd ../events || exit
rm -f package-lock.json

cd ../dialog || exit
rm -f package-lock.json

cd ../agents || exit
rm -f package-lock.json

cd ../server || exit
rm -f package-lock.json

cd ../client || exit
rm -f package-lock.json
