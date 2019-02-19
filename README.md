# Keptn Jenkins Operator

This operator is designed to use Jenkins as pipeline executor for various tasks. Thus, this operator has a pipeline to:
* change a configuration of a service,
* deploy a service to a dev environment,
* deploy a service to a staging environment, and
* deploy a service to a production environment.

In its current implementation, the operator contains a GitHub operator in order to listen to GitHub events. 

##### Table of Contents
 * [Install operator](#install)
 * [Uninstall operator](#install)

## Install operator <a id="install"></a>

1. Go to `~/jenkins-operator`.

    ```console
    $ pwd
    ~/jenkins-operator
    ```

1. This operator needs a Jenkins running in your cluster. Therefore, execute the `kubectl apply -f ./manifests/jenkins/*` command:

    ```console
    $ kubectl apply -f ./manifests/jenkins/*
    ```

1. To install the operator, execute the `kubectl apply -f ./manifests/operator/*` command: 

    ```console
    $ kubectl apply -f ./manifests/operator/*
    ```

1. To verify the installation, run the following `kubectl` command: 

    ```console
    $ kubectl get pods -n cicd
    NAME           STATUS    AGE
    ???
    ```

## Uninstall operator <a id="install"></a>

1. To uninstall the Jenkins and operator, run the following commands:

    ```console
    $ kubectl delete -f ./manifests/operator/*
    $ kubectl delete -f ./manifests/jenkins/*
    ```