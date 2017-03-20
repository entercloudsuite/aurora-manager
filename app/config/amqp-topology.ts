var config = require('../../topology');
import { Logger, LoggerFactory } from '../common';

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
  public MESSAGES = {};

  public static LOGGER: Logger = LoggerFactory.getLogger();

  constructor() {
    this.connection = {
      user: process.env.RABBIT_USER,
      pass: process.env.RABBIT_PASSWORD,
      server: [ process.env.RABBIT_HOST ],
      port: process.env.RABBIT_PORT,
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