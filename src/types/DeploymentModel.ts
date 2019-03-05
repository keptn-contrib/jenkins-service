import { ApiModel, ApiModelProperty, SwaggerDefinitionConstant } from 'swagger-express-ts';

@ApiModel({
  description: '',
  name: 'DeploymentModel',
})
export class DeploymentModel {
  service: string;
  image: string;
  stage: string;
}
