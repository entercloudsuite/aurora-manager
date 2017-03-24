import { Logger, LoggerFactory, RabbitClient, Stack, Request, ResourceNotFoundError, EventEmitter } from '../common';
import { ServiceModel, Service } from '../models';
import { Topology, APP_CONFIG } from '../config';
import { ServiceUtils } from '../utils';
import http = require('http');
const objectHash: any = require('object-hash');

export class ServiceManager {
  public serviceTable: {};
  private serviceStacks: {};
  private lastUsedService: {};
  private rabbitClient: RabbitClient;

  private static LOGGER: Logger = LoggerFactory.getLogger();

  constructor() {
    this.serviceTable = {};
    this.serviceStacks = {};
    this.lastUsedService = {};
    this.rabbitClient = new RabbitClient(Topology.EXCHANGES.generalExchange, Topology.QUEUES.general);
    this.registerHandlers();
  }

  /**
   * Creates a new service object, updates the service stack and notifies the gateway
   *
   * @param {Service} serviceOptions
   * @returns {Promise<any>}
   *
   * @memberOf ServiceManager
   */
  registerService(serviceOptions: Service): Promise<any> {
    ServiceManager.LOGGER.info(`Registering new service - ${JSON.stringify(serviceOptions)}`);
    const newService = new ServiceModel(
      serviceOptions.host, serviceOptions.port, serviceOptions.name,
      serviceOptions.state || 'READY', serviceOptions.routingPath, serviceOptions.options, 
      serviceOptions.id 
    );

    if (!newService.id) {
      newService.id = objectHash(newService);
    }

    this.serviceTable[newService.id] = newService;

    // Notify gateway on new service
    if (!this.serviceStacks[newService.name]) {
       this.rabbitClient.publishMessage(
         Topology.MESSAGES.newService,
         '',
         serviceOptions
       );
    }

    this.updateStack(serviceOptions.name, newService.id);


    return Promise.resolve(newService);
  }

  /**
   * @todo Add service instance HEARTBEAT check through AMQP messages
   * @param newService 
   */
  static updateFromConfigFile(newService: Service) {
    this['registerService'](newService)
      .then(service => {
        ServiceManager.LOGGER.debug('Registered service from config file');
      });
  }

  registerHandlers() {
    ServiceManager.LOGGER.debug('Registering message handlers');

    this.rabbitClient.rabbitConnection.handle(
      Topology.MESSAGES.serviceUpdate,
      ServiceManager.updateStatus.bind(this)
    );

    EventEmitter.eventEmitter.on(EventEmitter.UPDATE_FROM_FILE, ServiceManager.updateFromConfigFile.bind(this));
  }

  /**
   * Change service status on new notifications.
   * Status list - 'READY', 'HEARTBEAT', 'STARTED', 'DOWN'
   *
   * @static
   * @param {*} message
   *
   * @memberOf ServiceManager
   */
  static updateStatus(message: any) {
    ServiceManager.LOGGER.debug(`New service status - ${message.body.status} - from - ${message.body.name}`);
    if (message.body.status === 'READY') {
      this['updateStack'](this['serviceTable'][message.body.id].name, message.body.id);
    } else if (message.body.status === 'HEARTBEAT') {
       this['serviceTable'][message.body.id].lastUpdate = Date.now();
    }
  }

  /**
   * Adds a new service to the service stack
   *
   * @param {string} serviceName
   * @param {string} serviceId
   *
   * @memberOf ServiceManager
   */
  updateStack(serviceName: string, serviceId: string) {
    ServiceManager.LOGGER.debug(`Updating stack ${serviceName} with ${serviceId}`);
    if (!(serviceName in Object.keys(this.serviceStacks))) {
      this.serviceStacks[serviceName] = new Stack();
    }

    this.serviceStacks[serviceName].push(serviceId);
  }

  /**
   * Searches for an available service in in the stack
   *
   * @param {string} serviceName
   * @returns {Promise<any>}
   *
   * @memberOf ServiceManager
   */
  getAvailableService(serviceName: string): Promise<any> {
    ServiceManager.LOGGER.debug(`Listing avilable service for - ${serviceName}`);
    let serviceId = '';
    if (!this.serviceStacks[serviceName].isEmpty()) {
      serviceId = this.serviceStacks[serviceName].update();
    } else {
      return Promise.reject(new ResourceNotFoundError());
    }

    return Promise.resolve(this.serviceTable[serviceId].toJSON());
  }
}
