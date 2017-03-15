import { ApiError } from './api-error';

export class NotImplementedError extends ApiError {
  constructor(
    public message: string = 'Feature not implemented'
  ) {
    super(message, 501, 'NOT_IMPLEMENTED');
    this.name = 'NotImplemented';
  }
}