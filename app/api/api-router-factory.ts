import express = require('express');
import { Router } from 'express';
import { Logger, LoggerFactory, InvalidResourceUrlError } from '../common';
import { ServiceManager } from '../services';
import { ServiceManagerRouter } from './routes';

export class ApiRouterFactory {

  private static LOGGER: Logger = LoggerFactory.getLogger();

  private constructor() {}

  static getApiRouter(): Router {
    const apiRouter: Router = express.Router({ mergeParams: true });

    const serviceManager = new ServiceManager();
    
    const serviceManagerRouter: Router = new ServiceManagerRouter(serviceManager).router;
    
    ApiRouterFactory.LOGGER.info('Mounting routes');
    apiRouter.use('/', serviceManagerRouter);
    apiRouter.all('*', (req, res, next) => {
      next(new InvalidResourceUrlError());
    });

    return apiRouter;
  }
}
