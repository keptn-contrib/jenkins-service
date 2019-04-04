#!/bin/sh
REGISTRY_URI=$(kubectl describe svc docker-registry -n keptn | grep IP: | sed 's~IP:[ \t]*~~')

rm -f config/service/gen/service.yaml

cat config/service/service.yaml | \
  sed 's~REGISTRY_URI_PLACEHOLDER~'"$REGISTRY_URI"'~' >> config/service/gen/service.yaml

kubectl delete -f config/service/gen/service.yaml --ignore-not-found
kubectl apply -f config/service/gen/service.yaml

