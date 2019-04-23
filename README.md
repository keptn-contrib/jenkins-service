# Keptn Jenkins Service

This service is designed to use Jenkins for executing various continuous delivery tasks. Thus, this service can make use of Jenkins jobs to:
* deploy a service to a particular stage
* execute tests for a deployment
* promote the deployment to the next stage

To trigger these jobs, the service has subscriptions to event channels. In more details, the current implementation of the service listens to CloudEvents from type:
* `sh.keptn.events.configuration-changed`: When receiving this event, the service deploys an application based on the new configuration.
* `sh.keptn.events.deployment-finished`: When receiving this event, the service executes a test for a deployed application.
* `sh.keptn.events.evaluation-done`: When receiving this event, the service verifies the evaluation to decide whether the deployment can be promoted to the next stage.

## Secret for credentials
During the setup of the Jenkins, a secret is created that contains key-value pairs for the Jenkins URL, Jenkins user, and password:
* jenkinsurl="jenkins.keptn.svc.cluster.local" 
* user="$JENKINS_USER" 
* password="$JENKINS_PASSWORD"

## Docker Jenkins
The `docker-jenkins` folder contains a `Dockerfile` and all artifacts for building the Jenkins container image. Characteristics of this Jenkins image are:
* **Performance Signature Plugin 3.1.1**
* **Jenkins jobs**:
  * deploy
  * run_test
  * evaluation_done

## Install service <a id="install"></a>

1. To install the service, specify values for the following parameters:
    * REGISTRY_URI - URI of the container registry
    * JENKINS_USER - Jenkins user
    * JENKINS_PASSWORD - Password of Jenkins user
    * GITHUB_USER_EMAIL - Email of GitHub user
    * GITHUB_ORGANIZATION - GitHub organization used by keptn
    * GITHUB_PERSONAL_ACCESS_TOKEN - Personal access token from GitHub user
    * DT_API_TOKEN (optional) - Dynatrace API token
    * DT_TENANT_URL (optional) - Dynatrace tenant URL

1. Run the `deploy.sh` script as shown below: 

    ```console
    $ ./deploy.sh REGISTRY_URI JENKINS_USER JENKINS_PASSWORD GITHUB_USER_EMAIL GITHUB_ORGANIZATION GITHUB_PERSONAL_ACCESS_TOKEN DT_API_TOKEN DT_TENANT_URL
    ```

1. To verify the installation, execute the following `kubectl` commands: 

    ```console
    $ kubectl get ksvc -n keptn
    NAME                 AGE
    ...
    jenkins-service       1m
    ...
    ```

    ```console
    $ kubectl get pods -n keptn
    NAME                                                  READY     STATUS      RESTARTS   AGE
    ...
    jenkins-service-cjtgp-deployment-78c8588b6f-q4hzd     3/3       Running     0          1m
    ...
    ```

## Uninstall service <a id="install"></a>

1. To uninstall Jenkins, execute the following commands:

    ```console
    $ kubectl delete -f ./config/jenkins/gen/k8s-jenkins-deployment.yaml
    $ kubectl delete -f ./config/jenkins/k8s-jenkins-pvcs.yaml
    $ kubectl delete -f ./config/jenkins/k8s-jenkins-rbac.yaml
    ```
  
1. To uninstall the service, execute the following command:

    ```console
    $ kubectl delete -f ./config/gen/service.yml
    ```