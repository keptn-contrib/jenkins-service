import { DeploymentModel } from '../types/DeploymentModel';

const jenkins = require('jenkins')({ baseUrl: `http://${process.env.JENKINS_USER}:${process.env.JENKINS_PASSWORD}@${process.env.JENKINS_URL}` });

export class JenkinsService {

  private static instance: JenkinsService;

  private constructor() {
  }

  static async getInstance() {
    if (JenkinsService.instance === undefined) {
      JenkinsService.instance = new JenkinsService();
    }
    return JenkinsService.instance;
  }

  async newArtefact(deployment: DeploymentModel) : Promise<boolean> {
    const deployed: boolean = false;

    console.log('[jenkins-service]: Trigger new artefact.');

    if (deployment.version) {
      new Promise(resolve => {
        jenkins.job.build({
          name: `/_new-artefact`,
          parameters: {
            GITHUBORG: deployment.githuborg,
            PROJECT: deployment.project,
            STAGE: deployment.stage,
            APP: deployment.app,
            VERSION: deployment.version
          },
        }, function(err) {
          if (err) console.log(err);
          resolve();
        });
      });
      console.log('[jenkins-service]: New artefact pipeline triggered.');
    }
    return deployed;
  }

  async deployService(deployment: DeploymentModel, keptnContext: string) : Promise<boolean> {
    const deployed: boolean = false;

    console.log('[jenkins-service]: Trigger service deployment.');

    if (deployment.image) {
      new Promise(resolve => {
        jenkins.job.build({
          name: `/deploy`,
          parameters: {
            GITHUBORG: deployment.githuborg,
            PROJECT: deployment.project,
            TESTSTRATEGY: deployment.teststategy,
            DEPLOYMENTSTRATEGY: deployment.deploymentstrategy,
            STAGE: deployment.stage,
            SERVICE: deployment.service,
            IMAGE: deployment.image,
            TAG: deployment.tag,
            KEPTNCONTEXT: keptnContext,
            PREVBLUEVERSION: deployment.prevblueversion,
          },
        }, function(err) {
          if (err) console.log(err);
          resolve();
        });
      });
    } else if (deployment.version) {
      new Promise(resolve => {
        jenkins.job.build({
          name: `/_deploy-cf`,
          parameters: {
            GITHUBORG: deployment.githuborg,
            PROJECT: deployment.project,
            STAGE: deployment.stage,
            APP: deployment.app,
            VERSION: deployment.version,
          },
        }, function(err) {
          if (err) console.log(err);
          resolve();
        });
      });
    }

    return deployed;
  }

  async startTests(deployment: DeploymentModel, keptnContext: string) : Promise<boolean> {
    let started: boolean = false;
    
    console.log('[jenkins-service]: Trigger service testing.');

    if (deployment.teststategy !== '') {
      new Promise(resolve => {
        jenkins.job.build({
          name: `/test`,
          parameters: {
            GITHUBORG: deployment.githuborg,
            PROJECT: deployment.project,
            TESTSTRATEGY: deployment.teststategy,
            DEPLOYMENTSTRATEGY: deployment.deploymentstrategy,
            STAGE: deployment.stage,
            SERVICE: deployment.service,
            IMAGE: deployment.image,
            TAG: deployment.tag,
            KEPTNCONTEXT: keptnContext,
            PREVBLUEVERSION: deployment.prevblueversion,
          },
        }, function(err) {
          if (err) console.log(err);
          resolve();
        });
      });
      console.log('[jenkins-service]: Tests triggered.');
    } else {
      console.log('[jenkins-service]: No test triggered because no test strategy defined.');
    }

    return started;
  }

  async evaluateTests(deployment: DeploymentModel, keptnContext: string) : Promise<boolean> {
    let evaluated: boolean = false;

    console.log('[jenkins-service]: Trigger test evaluation.');

    new Promise(resolve => {
      jenkins.job.build({
        name: `/evaluate`,
        parameters: {
          GITHUBORG: deployment.githuborg,
          PROJECT: deployment.project,
          TESTSTRATEGY: deployment.teststategy,
          DEPLOYMENTSTRATEGY: deployment.deploymentstrategy,
          STAGE: deployment.stage,
          SERVICE: deployment.service,
          IMAGE: deployment.image,
          TAG: deployment.tag,
          KEPTNCONTEXT: keptnContext,
          PREVBLUEVERSION: deployment.prevblueversion,
        },
      }, function(err) {
        if (err) console.log(err);
        resolve();
      });
    });

    console.log('[jenkins-service]: Evaluation triggered.');
    return evaluated;
  }
}
