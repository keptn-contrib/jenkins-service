#!/bin/sh
REGISTRY_URI=$1

# Deploy service
rm -f config/service/gen/service.yaml

cat config/service/service.yaml | \
  sed 's~REGISTRY_URI_PLACEHOLDER~'"$REGISTRY_URI"'~' >> config/service/gen/service.yaml

kubectl apply -f config/service/gen/service.yaml

# Deploy Jenkins - see keptn/install/setupInfrastructure.sh:
rm -f config/service/gen/k8s-jenkins-deployment.yml

cat config/jenkins/k8s-jenkins-deployment.yml | \
  sed 's~GITHUB_USER_EMAIL_PLACEHOLDER~'"$GITHUB_USER_EMAIL"'~' | \
  sed 's~GITHUB_ORGANIZATION_PLACEHOLDER~'"$GITHUB_ORGANIZATION"'~' | \
  sed 's~DOCKER_REGISTRY_IP_PLACEHOLDER~'"$REGISTRY_URL"'~' | \
  sed 's~DT_TENANT_URL_PLACEHOLDER~'"$DT_TENANT_URL"'~' | \
  sed 's~DT_API_TOKEN_PLACEHOLDER~'"$DT_API_TOKEN"'~' >> config/service/gen/k8s-jenkins-deployment.yml

kubectl create -f config/jenkins/k8s-jenkins-pvcs.yml 
kubectl create -f config/service/gen/k8s-jenkins-deployment.yml
kubectl create -f config/jenkins/k8s-jenkins-rbac.yml

# Deploy Tiller for Helm
kubectl -n kube-system create serviceaccount tiller
kubectl create clusterrolebinding tiller --clusterrole=cluster-admin --serviceaccount=kube-system:tiller
helm init --service-account tiller

#kubectl -n kube-system  rollout status deploy/tiller-deploy