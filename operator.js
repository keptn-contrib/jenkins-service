const crypto = require('crypto');
const camelCase = require('camelcase');

var jenkins = require('jenkins')({ baseUrl: process.env.JENKINS_URL });

function scanGithubBranchSourceProject(appName) {
  return new Promise(resolve => {
    jenkins.job.build({ name: `acmfabric/${appName}`, parameters: { } }, function(err) {
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

function applyConfig(environment, appName, githubOrg) {
  return new Promise(resolve => {
    jenkins.job.build({ name: `${githubOrg}/keptn-deploy/${environment}`, parameters: { APP_NAME: appName } }, function(err) {
      if (err) console.log(err);
      resolve();
    });
  });
} 

function signRequestBody(key, body) {
  return `sha1=${crypto.createHmac('sha1', key).update(body, 'utf-8').digest('hex')}`;
}

function handlePullRequest(githubEventPayload, response) {
  console.log(`Github event action: ${githubEventPayload.action}`);
  var githubOrg = githubEventPayload.organization.login;
  // check if PR has been closed and merged
  if (githubEventPayload.pull_request && 
    githubEventPayload.pull_request.merged === true && 
    'closed' === githubEventPayload.action) 
  {
    console.log(`Github event pull request: ${JSON.stringify(githubEventPayload.pull_request)}`);
    if (githubEventPayload.pull_request.merged === true) {
      console.log(`Starting job for ${githubEventPayload.repository.name}`);
      configChange(githubEventPayload.repository.name, `pr-${githubEventPayload.number}`, 'dev', githubOrg).then(() => {
        response.writeHeader(200); response.end();
        return;
      });
    }
  } else if (githubEventPayload.pull_request && 
    'opened' === githubEventPayload.action) 
  {
    scanGithubBranchSourceProject(githubEventPayload.repository.name).then(() => {
      response.writeHeader(200); response.end();
      return;
    });  
  } else {
    response.writeHeader(200); response.end();
    return;
  }
}

function handlePush(githubEventPayload, response) {
  const refSplit = githubEventPayload.ref.split('/');
  const environment = refSplit[refSplit.length - 1];
  const commitMessage = githubEventPayload.head_commit.message;
  const githubOrg = githubEventPayload.repository.owner.name;
  if (commitMessage.includes('[CI-UPDATECONFIG]')) {
    const commitMessageSplit = commitMessage.split(':');
    const appName = commitMessageSplit[commitMessageSplit.length - 1].trim();

    if (appName !== undefined && environment !== undefined) {
      applyConfig(environment, appName, githubOrg).then(() => {
        response.status(200).send('OK');
        return;   
      });
    }
  }
  response.writeHeader(200); response.end();
  return;
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

function handleJenkinsBuildFailure(notificationPayload, response) {
  
}

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

module.exports.githubWebhookListener = (event, response) => {
  // console.log(event);
  const githubEvent = event.eventType;
  const githubEventPayload = event.body
  /* eslint-disable */
  /*
  console.log('---------------------------------');
  console.log(`Github-Event: "${githubEvent}" with action: "${JSON.stringify(event.body)}"`);
  console.log('---------------------------------');
  console.log('Payload', event.body);
  */
  /* eslint-enable */

  console.log(githubEventPayload);
  if (githubEventPayload === undefined) {
    response.writeHeader(500); response.end();
    return;
  }

  switch (githubEvent) {
    case 'push': handlePush(githubEventPayload, response); break;
    case 'pull_request': handlePullRequest(githubEventPayload, response); break;
    default: response.writeHeader(200); response.end();
  }
};