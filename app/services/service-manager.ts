import { Logger, LoggerFactory, RabbitClient, Stack, Request, ResourceNotFoundError } from '../common';
import { ServiceModel, Service } from '../models';
import objectHash = require('object-hash');
import http = require('http');
import { Topology, APP_CONFIG } from '../config';
import { ServiceUtils } from '../utils';

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
      'READY', serviceOptions.routingPath, serviceOptions.options
    );
    
    const serviceId = objectHash(newService);
    this.serviceTable[serviceId] = newService;

    if (!this.serviceStacks[newService.name]) {
      // this.generalQueue.publishMessage(
      //   this.generalQueue.generalExchange,
      //   this.generalQueue.messageTypes.NEW_SERVICE,
      //   '',
      //   serviceOptions
      // );
      this.notifyGateway(newService);
    }
    
    this.updateStack(serviceOptions.name, serviceId);
    

    return Promise.resolve(serviceId);
  }

  registerHandlers() {
    ServiceManager.updateStatus.bind(this);
    
    this.rabbitClient.rabbitConnection.handle(
      Topology.MESSAGES.newService,
      ServiceManager.updateStatus
    );
  }

  /**
   * Notify gateway on a new registered service
   *
   * @todo Use RabbitMQ transport layer in order to notify the gateway 
   * @param {Service} newService 
   * 
   * @memberOf ServiceManager
   */
  notifyGateway(newService: Service) {
    const requestOptions = <Request> {
      protocol: 'http:',
      host: APP_CONFIG.gatewayHost,
      port: APP_CONFIG.gatewayPort,
      path: '/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    };
    
    const requestBody = newService.toJSON();
    ServiceManager.LOGGER.debug(`Calling gateway on new service - ${JSON.stringify(newService)}`);
    ServiceUtils.sendRequest(requestOptions, requestBody);
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
      this.updateStack(this.serviceTable[message.body.id].name, message.body.id);
    } else if (message.body.status === 'HEARTBEAT') {
       this.serviceTable[message.body.id].lastUpdate = Date.now();
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