const crypto = require('crypto');
const camelCase = require('camelcase');

var jenkins = require('jenkins')({ baseUrl: process.env.JENKINS_URL });

module.exports.jenkinsNotificationListener = (event, response) => {
  console.log(event);
  const notificationPayload = event.body;

  switch (notificationPayload.status) {
    case 'success': handleJenkinsBuildSuccess(notificationPayload, response); break;
    case 'failure': handleJenkinsBuildFailure(notificationPayload, response); break;
    default: break;
  }

  response.writeHeader(200); response.end();
}

function handleJenkinsBuildSuccess(notificationPayload, response) {
  let environment;
  if (notificationPayload.environment === 'dev') {
    environment = 'staging';
  } else if (notificationPayload.environment === 'staging') {
    environment = 'production';
  } else {
    response.writeHeader(200); response.end();
    return; 
  }
  const githubOrg = notificationPayload.github_org;

  const pullRequestIDSplit = notificationPayload.pull_request.split(':');
  const pullRequestId = pullRequestIDSplit[pullRequestIDSplit.length-1];
  configChange(notificationPayload.service, pullRequestId, environment, githubOrg).then(() => {
    response.writeHeader(200); response.end();
  });
}

function applyConfig(environment, appName, githubOrg) {
  return new Promise(resolve => {
    jenkins.job.build({ name: `${githubOrg}/keptn-deploy/${environment}`, parameters: { APP_NAME: appName } }, function(err) {
      if (err) console.log(err);
      resolve();
    });
  });
} 

function configChange(appName, pullRequestNumber, environment, githubOrg) {
  return new Promise(resolve => {
    jenkins.job.build({ name: `${githubOrg}/keptn-deploy/configchange`, parameters: { APP_NAME: camelCase(appName), PULL_REQUEST: pullRequestNumber, ENVIRONMENT: environment, IMAGE: camelCase(appName).toLowerCase() } }, function(err) {
      if (err) console.log(err);
      resolve();
    });
  });
}

function handleJenkinsBuildFailure(notificationPayload, response) {
  // TODO: A build failed handler need to be implemented.
}
