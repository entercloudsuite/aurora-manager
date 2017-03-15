import { ApiError } from './api-error';

export class InvalidResourceUrlError extends ApiError {

  constructor(
    public message: string = 'Not a valid resource url.'
  ) {
    super(message, 404, 'INVALID_RESOURCE_URL');
    this.name = 'InvalidResourceUrlError';
  }

}
