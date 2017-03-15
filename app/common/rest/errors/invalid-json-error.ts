import { ApiError } from './api-error';

export class InvalidJsonError extends ApiError {

  constructor(
    public message: string = 'Request does not contain valid JSON data.'
  ) {
    super(message, 400, 'INVALID_JSON_ERROR');
    this.name = 'InvalidJsonError';
  }

}
