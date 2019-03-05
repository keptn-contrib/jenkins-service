import { DeploymentModel } from '../types/DeploymentModel';

const jenkins = require('jenkins')({ baseUrl: process.env.JENKINS_URL });

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
    const updated: boolean = false;

    jenkins.job.build({ name: `deploy`, parameters: {
      SERVICE: deployment.service,
      STAGE: deployment.stage,
      PROJECT: 'sockshop',
      GITHUB_ORG: 'keptn-tiger',
    } });

    return updated;
  }

  async startTests(deployment: DeploymentModel) : Promise<boolean> {
    let updated: boolean = false;

    return updated;
  }

  async evaluateTests(deployment: DeploymentModel) : Promise<boolean> {
    let updated: boolean = false;

    return updated;
  }
}
