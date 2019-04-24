#!/bin/sh
REGISTRY_URL=$1
JENKINS_USER=$2
JENKINS_PASSWORD=$3
GITHUB_USER_EMAIL=$4
GITHUB_ORGANIZATION=$5
GITHUB_PERSONAL_ACCESS_TOKEN=$6
DT_API_TOKEN=$7
DT_TENANT_URL=$8

# Deploy Jenkins - see keptn/install/setupInfrastructure.sh:
rm -f config/jenkins/gen/k8s-jenkins-deployment.yml

export GATEWAY=$(kubectl describe svc istio-ingressgateway -n istio-system | grep "LoadBalancer Ingress:" | sed 's~LoadBalancer Ingress:[ \t]*~~')

cat config/jenkins/k8s-jenkins-deployment.yml | \
  sed 's~GATEWAY_PLACEHOLDER~'"$GATEWAY"'~' | \
  sed 's~GITHUB_USER_EMAIL_PLACEHOLDER~'"$GITHUB_USER_EMAIL"'~' | \
  sed 's~GITHUB_ORGANIZATION_PLACEHOLDER~'"$GITHUB_ORGANIZATION"'~' | \
  sed 's~DOCKER_REGISTRY_IP_PLACEHOLDER~'"$REGISTRY_URL"'~' | \
  sed 's~DT_TENANT_URL_PLACEHOLDER~'"$DT_TENANT_URL"'~' | \
  sed 's~DT_API_TOKEN_PLACEHOLDER~'"$DT_API_TOKEN"'~' >> config/jenkins/gen/k8s-jenkins-deployment.yml

kubectl create -f config/jenkins/k8s-jenkins-pvcs.yml 
kubectl create -f config/jenkins/gen/k8s-jenkins-deployment.yml
kubectl create -f config/jenkins/k8s-jenkins-rbac.yml
kubectl create -f config/jenkins/k8s-jenkins-service-entry.yml

echo "Wait 200s for Jenkins..."
sleep 200

# Setup credentials in Jenkins
echo "--------------------------"
echo "Setup Credentials in Jenkins "
echo "--------------------------"

# Export Jenkins route in a variable
export JENKINS_URL="jenkins.keptn.$GATEWAY.xip.io"

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
}' \
--retry 8 \
--retry-connrefused


curl -X POST http://$JENKINS_URL/credentials/store/system/domain/_/createCredentials \
--user $JENKINS_USER:$JENKINS_PASSWORD \
--data-urlencode 'json={
  "": "0",
  "credentials": {
    "scope": "GLOBAL",
    "id": "perfsig-api-token",
    "apiToken": "'$DT_API_TOKEN'",
    "description": "Dynatrace API Token used by the Performance Signature plugin",
    "$class": "de.tsystems.mms.apm.performancesignature.dynatracesaas.model.DynatraceApiTokenImpl"
  }
}' \
--retry 8 \
--retry-connrefused

echo "--------------------------"
echo "End setup credentials in Jenkins "
echo "--------------------------"

# Create secret and deploy jenkins-service
kubectl create secret generic -n keptn jenkins-secret --from-literal=jenkinsurl="jenkins.keptn.svc.cluster.local" --from-literal=user="$JENKINS_USER" --from-literal=password="$JENKINS_PASSWORD"

kubectl delete -f config/service/service.yaml --ignore-not-found
kubectl apply -f config/service/service.yaml

# Deploy Tiller for Helm
kubectl -n kube-system create serviceaccount tiller
kubectl create clusterrolebinding tiller --clusterrole=cluster-admin --serviceaccount=kube-system:tiller
helm init --service-account tiller
