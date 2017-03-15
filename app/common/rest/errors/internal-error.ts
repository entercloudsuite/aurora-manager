import { ApiError } from './api-error';

export class InternalError extends ApiError {

  constructor(
    public originalError: Error,
    public message: string = 'An unexpected error has occurred.'
  ) {
    super(message, 500, 'INTERNAL_ERROR');
    this.name = 'InternalError';
  }

}
