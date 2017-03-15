import { RestRouter } from '../../common';
import { ServiceManagerController } from './service-manager-controller';
import { ServiceManager } from '../../services';

export class ServiceManagerRouter extends RestRouter {
  serviceManagerController: ServiceManagerController;

  constructor(serviceManager: ServiceManager) {
    super();
    this.serviceManagerController = new ServiceManagerController(serviceManager);
    this.initRoutes();
  }

  initRoutes() {
    this.router.get('/', this.wrapRouteFn(this.serviceManagerController, this.serviceManagerController.listRegisteredServices));
    this.router.post('/register', this.wrapRouteFn(this.serviceManagerController, this.serviceManagerController.registerService));
    this.router.get('/service', this.wrapRouteFn(this.serviceManagerController, this.serviceManagerController.listAvailableService));
    this.router.all('/', this.wrapRouteFn(this.serviceManagerController, this.serviceManagerController.throwMethodNotAllowedError));
  }
}
