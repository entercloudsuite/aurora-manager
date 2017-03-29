import { app } from '../app/app';
import { expect } from 'chai';
import { ServiceManager } from '../app/services';
import supertest = require('supertest');
import sinon = require('sinon');
import fs = require('fs');

describe('Itegration::RegisterService', () => {
    const services = [{
        host: '127.0.0.1',
        port: 3000,
        name: 'testService',
        routingPath: '/path'
    }];

    beforeEach(() => {
        fs.stat('./services.yml', (err) => {
            if (!err) {
                fs.truncate('./services.yml', 0, () => {

                });
            }
        });
    });

    it('should register a service', (done) => {
        supertest(app)
            .post('/register')
            .set('Content-Type', 'application/json')
            .send(services[0])
            .expect(200)
            .then(response => {
                expect(response.body).to.have.all.keys('data');
                done();
            });
    });

    it('should register multiple services', (done) => {
        supertest(app)
            .post('/register')
            .set('Content-Type', 'application/json')
            .send(services[0])
            .expect(200)
            .then(response => {
                expect(response.body).to.have.all.keys('data');
                done();
            });
    });

    it('should register different service types', (done) => {

    });

    it('should not register invalid service', (done) => {

    });
});