# Release Notes 0.1.0

## Release Goal

This service is designed to use Jenkins for executing various continuous delivery tasks. In this release, it can make use of Jenkins jobs to:
* deploy a service to a particular stage
* execute tests for a deployment
* promote the deployment to the next stage

To trigger these jobs, the service listens to CloudEvents from type:
* `sh.keptn.events.configuration-changed`: When receiving this event, the service deploys an application based on the new configuration.
* `sh.keptn.events.deployment-finished`: When receiving this event, the service executes a test for a deployed application.
* `sh.keptn.events.evaluation-done`: When receiving this event, the service verifies the evaluation to decide whether the deployment can be promoted to the next stage.
