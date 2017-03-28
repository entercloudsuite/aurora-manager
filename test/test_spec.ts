import { ServiceManager } from '../app/services/service-manager';
import { expect } from 'chai';

describe('Unit::ServiceManager', () => {
    it('Mocks a new service and registers it', () => {
        const abc = 1;
        expect(abc).to.be.equal(1);
    });

    it('Mocks a value and something', () => {
        const value = 2;
        expect(value).to.be.equal(2);
    })
});