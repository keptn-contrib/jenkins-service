import 'reflect-metadata';
import * as express from 'express';
import { expect } from 'chai';
import 'mocha';
import * as sinon from 'sinon';
import { cleanUpMetadata } from 'inversify-express-utils';
import { JenkinsService } from './JenkinsService';
import { CloudEvent } from 'cloudevent';

describe('JenkinsService', () => {
  let jenkinsSvc : JenkinsService;
  let request: express.Request;
  let response: express.Response;

  beforeEach(() => {
    cleanUpMetadata();
    request = {} as express.Request;
    response = {} as express.Response;
  });
  it('Should trigger a Jenkins pipeline', async () => {
    jenkinsSvc = await JenkinsService.getInstance();
  }).timeout(10000);

});
