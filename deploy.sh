#!/bin/sh
REGISTRY_URI=$1

# Deploy operator
rm config/operator/gen/operator.yaml

cat config/operator/operator.yaml | \
  sed 's~REGISTRY_URI_PLACEHOLDER~'"$REGISTRY_URI"'~' >> config/operator/gen/operator.yaml

kubectl apply -f config/operator/gen/operator.yaml

# Deploy Jenkins
# missing