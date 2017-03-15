import { Service } from './';

export class ServiceModel implements Service{
  public host: string;
  public port: number;
  public name: string;
  public status = 'READY';
  public routingPath: string;
  public options: {};
  public lastUpdate: any;
  
  constructor(host: string, port: number, name: string, status: string, routingPath: string, options: {}) {
    this.host = host;
    this.port = port;
    this.name = name;
    this.status = status;
    this.routingPath = routingPath;
    this.options = options || {};
    this.lastUpdate = Date.now();
  }
  
  public toJSON() {
    return {
      host: this.host,
      port: this.port,
      options: this.options,
      name: this.name,
      routingPath: this.routingPath
    }
  }
}