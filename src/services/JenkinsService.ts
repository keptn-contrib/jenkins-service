import { DeploymentModel } from '../types/DeploymentModel';

//const jenkins = require('jenkins')({ baseUrl: process.env.JENKINS_URL });
const jenkins = require('jenkins')({ baseUrl: 'http://admin:AiTx4u8VyUV8tCKk@jenkins.keptn.svc.cluster.local' });

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

  async deployService(deployment: DeploymentModel) : Promise<boolean> {
    const deployed: boolean = false;

    new Promise(resolve => {
      jenkins.job.build({
        name: `/deploy`,
        parameters: {
          GITHUBORG: deployment.gitHubOrg,
          PROJECT: deployment.project,
          STAGE: deployment.stage,
          SERVICE: deployment.service,
          IMAGE: deployment.image,
          TAG: deployment.tag,
        },
      }, function(err) {
        if (err) console.log(err);
        resolve();
      });
    });

    return deployed;
  }

  async startTests(deployment: DeploymentModel) : Promise<boolean> {
    let started: boolean = false;
    let pipeline : string = '';

    if (deployment.stage === 'dev') {
      pipeline = '/test.functional';
    } else if (deployment.stage === 'staging') {
      pipeline = '/test.performance';
    } else {
      pipeline = 'notest';
    }
    console.log(pipeline);
    if (pipeline === 'notest') {
      new Promise(resolve => {
        jenkins.job.build({
          name: pipeline,
          parameters: {
            GITHUBORG: deployment.gitHubOrg,
            PROJECT: deployment.project,
            STAGE: deployment.stage,
            SERVICE: deployment.service,
            IMAGE: deployment.image,
            TAG: deployment.tag,
          },
        }, function(err) {
          if (err) console.log(err);
          resolve();
        });
      });
    }

    return started;
  }

  async evaluateTests(deployment: DeploymentModel) : Promise<boolean> {
    let evaluated: boolean = false;

    new Promise(resolve => {
      jenkins.job.build({
        name: `/evaluate`,
        parameters: {
          GITHUBORG: deployment.gitHubOrg,
          PROJECT: deployment.project,
          STAGE: deployment.stage,
          SERVICE: deployment.service,
          IMAGE: deployment.image,
          TAG: deployment.tag,
        },
      }, function(err) {
        if (err) console.log(err);
        resolve();
      });
    });

    return evaluated;
  }
}
