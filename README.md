# Keptn Jenkins Service

This service is designed to use Jenkins as pipeline executor for various tasks. Thus, this service has a pipeline to:
* change a configuration of a service,
* deploy a service to a dev environment,
* deploy a service to a staging environment, and
* deploy a service to a production environment.

In its current implementation, the service contains a GitHub service in order to listen to GitHub events. 

##### Table of Contents
 * [Install service](#install)
 * [Uninstall service](#install)

## Install service <a id="install"></a>

1. Go to `~/jenkins-service`.

    ```console
    $ pwd
    ~/jenkins-service
    ```

1. This service needs a Jenkins running in your cluster. Therefore, execute the `kubectl apply -f ./manifests/jenkins/*` command:

    ```console
    $ kubectl apply -f ./manifests/jenkins/*
    ```

1. To install the service, execute the `kubectl apply -f ./manifests/service/*` command: 

    ```console
    $ kubectl apply -f ./manifests/service/*
    ```

1. To verify the installation, run the following `kubectl` command: 

    ```console
    $ kubectl get pods -n cicd
    NAME           STATUS    AGE
    ???
    ```

## Uninstall service <a id="install"></a>

1. To uninstall the Jenkins and service, run the following commands:

    ```console
    $ kubectl delete -f ./manifests/service/*
    $ kubectl delete -f ./manifests/jenkins/*
    ```