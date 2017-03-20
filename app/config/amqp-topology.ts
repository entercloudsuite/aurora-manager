import fs = require('fs');
import { Logger, LoggerFactory } from '../common';
import { APP_CONFIG } from '../config';

export class AMQPTopology {
  private connection: {};
  private exchanges = [];
  private queues = [];
  private bindings = [];

  public EXCHANGES = {
    servicesExchange: '',
    generalExchange: ''
  };
  public QUEUES = {
    general: '',
    servicesRequests: '',
    servicesMessages: '',
  };
  public MESSAGES = {
    newService: ''
  };

  public static LOGGER: Logger = LoggerFactory.getLogger();

  constructor() {
    const config = JSON.parse(fs.readFileSync(APP_CONFIG.topologyFile, 'utf-8'));
    this.connection = {
      user: APP_CONFIG.rabbitUser,
      pass: APP_CONFIG.rabbitUserPassword,
      server: [ APP_CONFIG.rabbitHost ],
      port: APP_CONFIG.rabbitPort,
      vhost: '%2f',
      timeout: 1000,
      failAfter: 30,
      retryLimit: 400
    };

    Object.keys(config.exchanges).forEach(exchange => {
      this.EXCHANGES[exchange] = config.exchanges[exchange].name;
      this.exchanges.push({
        name: config.exchanges[exchange].name,
        type: config.exchanges[exchange].type,
        autoDelete: true
      });
    });

    Object.keys(config.queues).forEach(queue => {
      this.QUEUES[queue] = config.queues[queue];
      this.queues.push({
        name: config.queues[queue],
        autoDelete: true
      });
    });

    Object.keys(config.bindings).forEach(queueName => {
      this.bindings.push({
        exchange: config.bindings[queueName][0],
        target: queueName,
        keys: config.bindings[queueName][1]
      });
    });

    this.MESSAGES = config.messages;
  }

  createTopology(rabbit): any {
    return rabbit.configure({
      connection: this.connection,
      exchanges: this.exchanges,
      queues: this.queues,
      bindings: this.bindings
    });
  }
}

export const Topology = new AMQPTopology();