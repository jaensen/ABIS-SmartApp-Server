#!/bin/bash
cd app || exit
ng build
cd .. || exit
npm start
