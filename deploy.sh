#!/bin/sh
REGISTRY_URI=$1

# Deploy operator
rm -f config/operator/gen/operator.yaml

cat config/operator/operator.yaml | \
  sed 's~REGISTRY_URI_PLACEHOLDER~'"$REGISTRY_URI"'~' >> config/operator/gen/operator.yaml

kubectl apply -f config/operator/gen/operator.yaml

# Deploy Jenkins - see keptn/install/setupInfrastructure.sh:
rm -f config/operator/gen/k8s-jenkins-deployment.yml

cat config/jenkins/k8s-jenkins-deployment.yml | \
  sed 's~GITHUB_USER_EMAIL_PLACEHOLDER~'"$GITHUB_USER_EMAIL"'~' | \
  sed 's~GITHUB_ORGANIZATION_PLACEHOLDER~'"$GITHUB_ORGANIZATION"'~' | \
  sed 's~DOCKER_REGISTRY_IP_PLACEHOLDER~'"$REGISTRY_URL"'~' | \
  sed 's~DT_TENANT_URL_PLACEHOLDER~'"$DT_TENANT_URL"'~' | \
  sed 's~DT_API_TOKEN_PLACEHOLDER~'"$DT_API_TOKEN"'~' >> config/operator/gen/k8s-jenkins-deployment.yml

kubectl create -f config/jenkins/k8s-jenkins-pvcs.yml 
kubectl create -f config/operator/gen/k8s-jenkins-deployment.yml
kubectl create -f config/jenkins/k8s-jenkins-rbac.yml