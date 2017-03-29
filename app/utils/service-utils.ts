import { Logger, LoggerFactory, InternalError, Request } from '../common';
import { Service } from '../models';
import http = require('http');
import fs = require('fs');
import yaml = require('js-yaml');

export class ServiceUtils {
  private static LOGGER: Logger = LoggerFactory.getLogger();

  /**
   * Parses the IP Address from a NODE Request object
   * 
   * @static
   * @param {any} incomingRequest 
   * @returns {Promise<any>} 
   * 
   * @memberOf ServiceUtils
   */
  static getIPAddress(incomingRequest): Promise<any> {
    const ipAddress = incomingRequest.headers['x-forwarded-for'] ||
      incomingRequest.connection.remoteAddress ||
      incomingRequest.socket.remoteAddress ||
      incomingRequest.connection.socket.remoteAddress;
    return Promise.resolve(ipAddress.substring(ipAddress.lastIndexOf(':')+1, ipAddress.length));
  }
  
  /**
   * Creates a new request with the specified parameters, parses and returns the response
   * 
   * @static
   * @param {Request} requestOptions 
   * @param {*} [requestBody] 
   * @returns 
   * 
   * @memberOf ServiceUtils
   */
  static sendRequest(requestOptions: Request, requestBody?: any) {
    if (requestBody) {
      requestBody = JSON.stringify(requestBody);
      requestOptions.headers['Content-Length'] = Buffer.byteLength(requestBody);
    }
    
    return new Promise((resolve, reject) => {
      let responseBody: string = '';
      const newRequest = http.request(requestOptions, res => {
        res.setEncoding('utf8');
        res.on('data', chunk => {
          responseBody += chunk;
        });

        res.on('end', () => {
          res['body'] = responseBody;
          return resolve(res);
        });
      });
      
      newRequest.on('error', requestError => {
        ServiceUtils.LOGGER.error(`Request error - ${JSON.stringify(requestError)}`);
        return reject(new InternalError(requestError));
      });

      if (requestBody) {
        newRequest.write(requestBody);
      }

      newRequest.end();
    });
  }

    static readYMLFile(filePath: string): Promise<any> {
    try {
      return Promise.resolve(yaml.safeLoad(fs.readFileSync(filePath, 'utf8')));
    } catch (error) {
      return Promise.reject(error);
    }
  }

  static writeYMLFile(jsObject: {}, filePath: string): Promise<any> {
    try {
      fs.writeFile(filePath, yaml.safeDump(jsObject), err => {
        if (err) {
          return Promise.reject(err);
        }

        return Promise.resolve('Successfully updated YAML file');
      })
    } catch(error) {
      return Promise.reject(error);
    }
  }

  static updateServicesConfigFile(newService: Service) {
    ServiceUtils.readYMLFile('./services.yml')
      .then(result => {
        if (result === undefined) {
          result = {};
        }
        result[newService.name] = {
          host: newService.host,
          port: newService.port,
          id: newService.id,
          path: newService.routingPath,
          options: newService.options || ''
        };
        return ServiceUtils.writeYMLFile(result, './services.yml');
      })
      .then(result => {
        ServiceUtils.LOGGER.debug(`Updated services config file`);
      })
      .catch(error => {
        ServiceUtils.LOGGER.error(`Error while updating services file ${JSON.stringify(error)}`);
      });
    }

  static parseServicesConfigFile(): Promise<any> {
    return ServiceUtils.readYMLFile('./services.yml')
      .then(yamlObject => {
        if (yamlObject === undefined) {
          return Promise.reject('Encountered empty services file');
        }
        return Promise.resolve(Object.keys(yamlObject).map(key => {
          ServiceUtils.LOGGER.debug(`Adding ${key}, with ${JSON.stringify(yamlObject[key])} to services list.`)
          return {
            name: key,
            id: yamlObject[key].id,
            host: yamlObject[key].host,
            port: yamlObject[key].port,
            routingPath: yamlObject[key].path,
            options: yamlObject[key].options
          };
        }));
      });
  }  
}
