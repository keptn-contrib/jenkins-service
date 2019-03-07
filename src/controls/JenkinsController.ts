import 'reflect-metadata';
import * as express from 'express';
import { inject, injectable } from 'inversify';
import {
  controller,
  httpGet,
  httpPost,
  httpDelete,
  interfaces,
} from 'inversify-express-utils';
import {
  ApiOperationGet,
  ApiOperationPost,
  ApiOperationDelete,
  ApiPath,
  SwaggerDefinitionConstant,
} from 'swagger-express-ts';

import { JenkinsService } from '../services/JenkinsService';

import { CloudEvent } from 'cloudevent';

@ApiPath({
  name: 'Jenkins',
  path: '/',
  security: { apiKeyHeader: [] },
})
@controller('/')
export class JenkinsController implements interfaces.Controller {

  constructor() { }

  @ApiOperationPost({
    description: 'Handle channel events',
    parameters: {
      body: {
        description: 'Handle channel events',
        model: '',
        required: true,
      },
    },
    responses: {
      200: {
      },
    },
    summary: 'Handle channel events',
  })
  @httpPost('/')
  public async handleEvent(
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ): Promise<void> {

    if (request.body.eventType) {
      const cloudEvent : CloudEvent = request.body;
      const jenkinsSvc : JenkinsService = await JenkinsService.getInstance();

      if (request.body.eventType == 'sh.keptn.events.configuration-changed') {
        await jenkinsSvc.deployService(cloudEvent.data);

      } else if (request.body.eventType == 'sh.keptn.events.deployment-finished') {
        await jenkinsSvc.startTests(cloudEvent.data);

      } else if (request.body.eventType == 'sh.keptn.events.tests-finished') {
        await jenkinsSvc.evaluateTests(cloudEvent.data);

      } else {
        console.log(`[jenkins]: This service does not handle the event type ${request.body.eventType}.`);
      }
    }

    const result = {
      result: 'success',
    };

    response.send(result);
  }
}
