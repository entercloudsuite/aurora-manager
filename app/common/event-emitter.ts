import events = require('events');
import { Logger, LoggerFactory } from '../common';
import { ServiceManager } from '../services/';

export class APIEvents {
  public eventEmitter: events.EventEmitter;
  public serviceInstances: {
    serviceManager: ServiceManager
  };
  
  public NEW_SERVICE: string;
  public SERVICE_STATUS_UPDATE: string;

  private static LOGGER: Logger = LoggerFactory.getLogger();

  constructor() {
    this.eventEmitter = new events.EventEmitter();
    this.NEW_SERVICE = 'NEW_SERVICE';
    this.SERVICE_STATUS_UPDATE = 'SERVICE_UPDATE';
  }
}

export let EventEmitter = new APIEvents();