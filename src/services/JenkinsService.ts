import { DeploymentModel } from '../types/DeploymentModel';

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
    let updated: boolean = false;

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
