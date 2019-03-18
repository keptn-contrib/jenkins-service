# Keptn Jenkins Service

This service is designed to use Jenkins as pipeline executor for various tasks. Thus, this service has a pipeline to:
* deploy a service to a stage,
* execute tests for a service, 
* evaluate the test result.

To trigger these pipelines, the service has subscriptions to event channels. Thus, the current implementation of the service listens to:
* a configuration changed event to deploy a service based on the new configuration,
* a deployment finised event to test a freshly deployed service,
* a test finished event to promote the service to the next stage meaning to send a new artifact event for the next stage.

## Install service <a id="install"></a>

1. To install the service, run the `deploy.sh` script as shown below: 

    ```console
    $ ./deploy.sh
    ```

1. To verify the installation, run the following `kubectl` commands: 

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

1. To uninstall Jenkins, run the following commands:

    ```console
    $ kubectl delete -f ./config/jenkins/gen/k8s-jenkins-deployment.yaml
    $ kubectl delete -f ./config/jenkins/k8s-jenkins-pvcs.yaml
    $ kubectl delete -f ./config/jenkins/k8s-jenkins-rbac.yaml
    ```
  
1. To uninstall the service, run the following command:

    ```console
    $ kubectl delete -f ./config/gen/service.yml
    ```