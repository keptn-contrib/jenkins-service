import { ApiModel, ApiModelProperty, SwaggerDefinitionConstant } from 'swagger-express-ts';

@ApiModel({
  description: '',
  name: 'DeploymentModel',
})
export class DeploymentModel {
  githuborg: string;
  project: string;
  stage: string;
  service: string;
  image: string;
  tag: string;
}
