#!/bin/bash

REGISTRY_URL=$1
JENKINS_USER=$2
JENKINS_PASSWORD=$3
GITHUB_USER_NAME=$4
GITHUB_USER_EMAIL=$5
GITHUB_ORGANIZATION=$6
GITHUB_PERSONAL_ACCESS_TOKEN=$7

source ./deploy_utils.sh

# Deploy Jenkins
rm -f config/jenkins/gen/k8s-jenkins-deployment.yml

export DOMAIN=$(kubectl get cm keptn-domain -n keptn -oyaml | yq r - data.app_domain)
verify_variable "$DOMAIN" "DOMAIN is empty and could not be read from the keptn-domain ConfigMap."

cat config/jenkins/k8s-jenkins-deployment.yml | \
  sed 's~DOMAIN_PLACEHOLDER~'"$DOMAIN"'~' | \
  sed 's~GITHUB_USER_EMAIL_PLACEHOLDER~'"$GITHUB_USER_EMAIL"'~' | \
  sed 's~GITHUB_ORGANIZATION_PLACEHOLDER~'"$GITHUB_ORGANIZATION"'~' | \
  sed 's~DOCKER_REGISTRY_IP_PLACEHOLDER~'"$REGISTRY_URL"'~' >> config/jenkins/gen/k8s-jenkins-deployment.yml

kubectl apply -f config/jenkins/k8s-jenkins-pvcs.yml 
verify_kubectl $? "Creating persistent volume claim for jenkins failed."

kubectl apply -f config/jenkins/gen/k8s-jenkins-deployment.yml
verify_kubectl $? "Creating deployment for jenkins failed."

kubectl apply -f config/jenkins/k8s-jenkins-rbac.yml
verify_kubectl $? "Creating cluster role binding for jenkins failed."

kubectl apply -f config/jenkins/k8s-jenkins-service-entry.yml
verify_kubectl $? "Creating service entries for jenkins failed."

wait_for_deployment_in_namespace "jenkins" "keptn" 

echo "Wait 100s for Jenkins..."
sleep 100

JENKINS_URL="jenkins.keptn.$DOMAIN"

# Configure Jenkins with GitHub credentials
RETRY=0; RETRY_MAX=12; 

while [[ $RETRY -lt $RETRY_MAX ]]; do
  curl -X POST http://$JENKINS_URL/credentials/store/system/domain/_/createCredentials \
    --user $JENKINS_USER:$JENKINS_PASSWORD \
    --data-urlencode 'json={
      "": "0",
      "credentials": {
        "scope": "GLOBAL",
        "id": "git-credentials-acm",
        "username": "'$GITHUB_USER_NAME'",
        "password": "'$GITHUB_PERSONAL_ACCESS_TOKEN'",
        "description": "Token used by Jenkins to access the GitHub repositories",
        "$class": "com.cloudbees.plugins.credentials.impl.UsernamePasswordCredentialsImpl"
      }
    }'

  if [[ $? == '0' ]]
  then
    print_debug "Git credentials in Jenkins created."
    break
  fi
  RETRY=$[$RETRY+1]
  print_debug "Retry: ${RETRY}/${RETRY_MAX} - Wait 10s for creating git credentials in Jenkins ..."
  sleep 10
done

if [[ $RETRY == $RETRY_MAX ]]; then
  print_error "Git credentials could not be created in Jenkins."
  exit 1
fi

# Create secret and deploy jenkins-service
kubectl create secret generic -n keptn jenkins-secret --from-literal=jenkinsurl="jenkins.keptn.svc.cluster.local" --from-literal=user="$JENKINS_USER" --from-literal=password="$JENKINS_PASSWORD"
verify_kubectl $? "Creating secret for jenkins-service failed."

kubectl delete -f config/service/service.yaml --ignore-not-found
kubectl apply -f config/service/service.yaml
verify_kubectl $? "Deploying jenkins-service failed."
