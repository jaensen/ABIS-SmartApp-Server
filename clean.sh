#!/bin/bash
MY_PATH="`dirname \"$0\"`"              # relative
MY_PATH="`( cd \"$MY_PATH\" && pwd )`"  # absolutized and normalized
cd "$MY_PATH" || exit

cd types || exit
rm -f package-lock.json
rm -r -f dist
npm install
npx tsc

cd ../log || exit
rm -f package-lock.json
rm -r -f dist
npm install
npx tsc

cd ../interfaces || exit
rm -f package-lock.json
rm -r -f dist
npm install
npx tsc

cd ../data || exit
rm -f package-lock.json
rm -r -f dist
npm install
npx tsc

cd ../events || exit
rm -f package-lock.json
rm -r -f dist
npm install
npx tsc

cd ../dialog || exit
rm -f package-lock.json
rm -r -f dist
npm install
npx tsc

cd ../agents || exit
rm -f package-lock.json
rm -r -f dist
npm install
npx tsc

cd ../server || exit
rm -f package-lock.json
rm -r -f dist
npm install
npx tsc

cd ../client || exit
rm -f package-lock.json
rm -r -f dist
npm install
npx tsc
