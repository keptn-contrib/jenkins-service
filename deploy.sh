#!/bin/sh
REGISTRY_URI=$1

export JENKINS_USER=$(cat creds.json | jq -r '.jenkinsUser')
export JENKINS_PASSWORD=$(cat creds.json | jq -r '.jenkinsPassword')
export GITHUB_USER_EMAIL=$(cat creds.json | jq -r '.githubUserEmail')
export GITHUB_ORGANIZATION=$(cat creds.json | jq -r '.githubOrg')
export DT_TENANT_ID=$(cat creds.json | jq -r '.dynatraceTenant')
export DT_API_TOKEN=$(cat creds.json | jq -r '.dynatraceApiToken')
export DT_TENANT_URL="$DT_TENANT_ID.live.dynatrace.com"

# Deploy Jenkins - see keptn/install/setupInfrastructure.sh:
rm -f config/service/gen/k8s-jenkins-deployment.yml

cat config/jenkins/k8s-jenkins-deployment.yml | \
  sed 's~GITHUB_USER_EMAIL_PLACEHOLDER~'"$GITHUB_USER_EMAIL"'~' | \
  sed 's~GITHUB_ORGANIZATION_PLACEHOLDER~'"$GITHUB_ORGANIZATION"'~' | \
  sed 's~DOCKER_REGISTRY_IP_PLACEHOLDER~'"$REGISTRY_URL"'~' | \
  sed 's~DT_TENANT_URL_PLACEHOLDER~'"$DT_TENANT_URL"'~' | \
  sed 's~DT_API_TOKEN_PLACEHOLDER~'"$DT_API_TOKEN"'~' >> config/service/gen/k8s-jenkins-deployment.yml

kubectl create -f config/jenkins/k8s-jenkins-pvcs.yml 
kubectl create -f config/jenkins/gen/k8s-jenkins-deployment.yml
kubectl create -f config/jenkins/k8s-jenkins-rbac.yml

# Export Jenkins route in a variable
export JENKINS_URL=$(kubectl describe svc jenkins -n cicd | grep "LoadBalancer Ingress:" | sed 's~LoadBalancer Ingress:[ \t]*~~')

# Create secret
kubectl create secret generic -n keptn jenkins-secret --from-literal=jenkinsurl="$JENKINS_URL" --from-literal=user="$JENKINS_USER" --from-literal=password="$JENKINS_PASSWORD"

# Deploy service
rm -f config/service/gen/service.yaml

cat config/service/service.yaml | \
  sed 's~REGISTRY_URI_PLACEHOLDER~'"$REGISTRY_URI"'~' >> config/service/gen/service.yaml

kubectl apply -f config/service/gen/service.yaml

# Deploy Tiller for Helm
kubectl -n kube-system create serviceaccount tiller
kubectl create clusterrolebinding tiller --clusterrole=cluster-admin --serviceaccount=kube-system:tiller
helm init --service-account tiller

#kubectl -n kube-system  rollout status deploy/tiller-deploy