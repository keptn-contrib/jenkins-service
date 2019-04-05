#!/bin/sh
REGISTRY_URI=$(kubectl describe svc docker-registry -n keptn | grep IP: | sed 's~IP:[ \t]*~~')

rm -f config/service/gen/service-build.yaml

cat config/service/service.yaml | \
  sed 's~REGISTRY_URI_PLACEHOLDER~'"$REGISTRY_URI"'~' >> config/service/gen/service-build.yaml

kubectl delete -f config/service/gen/service-build.yaml --ignore-not-found
kubectl apply -f config/service/gen/service-build.yaml

