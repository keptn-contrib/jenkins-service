#!/bin/sh
REGISTRY_URI=$1
CHANNEL_URI=$2

cat config/operator.yaml | \
  sed 's~REGISTRY_URI_PLACEHOLDER~'"$REGISTRY_URI"'~' | kubectl apply -f -