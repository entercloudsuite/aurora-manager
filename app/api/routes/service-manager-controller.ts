import { Logger, LoggerFactory, RestController } from '../../common';
import { ServiceManager } from '../../services';
import { ServiceUtils } from '../../utils';

export class ServiceManagerController extends RestController {
  constructor(private serviceManager: ServiceManager) {
    super();
  }

  private static LOGGER: Logger = LoggerFactory.getLogger();

  registerService(req, res, next): Promise<any> {
    ServiceManagerController.LOGGER.info(`Registering new service with ${JSON.stringify(req.body)}`);
    return ServiceUtils.getIPAddress(req)
      .then(ipAddress => {
        let options = req.body;
        options['host'] = ipAddress;
        return this.serviceManager.registerService(options);
      })
      .then(registeredService => {
        ServiceUtils.updateServicesConfigFile(registeredService);
        return this.respond(res, registeredService.id);
      });
  }

  listRegisteredServices(req, res): Promise<any>{
    return Promise.resolve(this.respond(res, this.serviceManager.serviceTable));
  }
  
  /**
   * 
   * @todo Add different endpoint with a parameter (/service/:serviceName)
   * @param {any} req 
   * @param {any} res 
   * @returns {Promise<any>} 
   * 
   * @memberOf ServiceManagerController
   */
  listAvailableService(req, res): Promise<any> {
    return this.serviceManager.getAvailableService(req.headers['service-name'])
      .then(serviceDetails => {
        return this.respond(res, serviceDetails);
      });
  }
}
