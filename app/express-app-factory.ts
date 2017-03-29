import { Express, Router, RequestHandler, ErrorRequestHandler } from 'express';
import express = require('express');
import bodyParser = require('body-parser');
import { Logger, LoggerFactory, EventEmitter } from './common';
import { ServiceUtils } from './utils';
import fs = require('fs');

export class ExpressAppFactory {
  private static LOGGER: Logger = LoggerFactory.getLogger();
  private constructor() {}

  static getExpressApp(
    apiRouter: Router,
    preApiRouterMiddlewareFns: Array<RequestHandler | ErrorRequestHandler>,
    postApiRouterMiddlewareFns: Array<RequestHandler | ErrorRequestHandler>): Express {

    const app: Express = express();

    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    if (preApiRouterMiddlewareFns != null) {
      postApiRouterMiddlewareFns.forEach((middlewareFn) => app.use(middlewareFn));
    }

    app.use('/', apiRouter);

    if (postApiRouterMiddlewareFns != null) {
      postApiRouterMiddlewareFns.forEach((middlewareFn) => app.use(middlewareFn));
    }

    if (fs.existsSync('./services.yml')) {
      ServiceUtils.parseServicesConfigFile()
        .then(servicesList => servicesList.map(service => { 
          EventEmitter.eventEmitter.emit(EventEmitter.UPDATE_FROM_FILE, service);
        }))
        .catch(error => {
          ExpressAppFactory.LOGGER.warn(error);
        });
    } else {
      ExpressAppFactory.LOGGER.debug('Creating empty routes file')
      fs.closeSync(fs.openSync('./services.yml', 'w'));
    }

    return app;
  }

}
