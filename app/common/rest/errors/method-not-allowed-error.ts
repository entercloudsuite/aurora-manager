import { ApiError } from './api-error';

export class MethodNotAllowedError extends ApiError {

  constructor(
    public message: string = 'The endpoint does not support this HTTP method.'
  ) {
    super(message, 405, 'METHOD_NOT_ALLOWED');
    this.name = 'MethodNotAllowedError';
  }

}
