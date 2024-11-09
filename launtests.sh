#!/bin/bash

export WS_ROOT=`pwd`
export MY_VAR="l:\\Datas"
export MY_VAR2="Unicode"
export HOME="/User/frank"
export ENV="prod"

mkdir -p ./Unittests-tmp

npm test
