import { DeploymentModel } from '../types/DeploymentModel';

//const jenkins = require('jenkins')({ baseUrl: 'http://admin:AiTx4u8VyUV8tCKk@jenkins.keptn.svc.cluster.local' });
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
    return deployed;
  }
  
  async deployService(deployment: DeploymentModel) : Promise<boolean> {
    const deployed: boolean = false;

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
            KEPTNCONTEXT: deployment.keptnContext,
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


  async startTests(deployment: DeploymentModel) : Promise<boolean> {
    let started: boolean = false;

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
            KEPTNCONTEXT: deployment.keptnContext,
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

  async evaluateTests(deployment: DeploymentModel) : Promise<boolean> {
    let evaluated: boolean = false;

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
          KEPTNCONTEXT: deployment.keptnContext,
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
