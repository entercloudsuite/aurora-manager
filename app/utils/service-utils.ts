import { Logger, LoggerFactory, InternalError, Request } from '../common';
import http = require('http');


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
}
