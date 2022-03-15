#!/usr/bin/env bash

docker build --tag audio-converter-dev -f ./dev.Dockerfile .
docker run --rm -ti --env-file <(env | grep AWS) --env-file <(env | grep S3) -v "$HOME/.aws/credentials:/root/.aws/credentials" -v "$PWD:/var/task" audio-converter-dev "$@"