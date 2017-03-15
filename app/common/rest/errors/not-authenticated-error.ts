import { ApiError } from './api-error';

export class NotAuthenticated extends ApiError {

  constructor(
    public message: string = 'Authentication required.'
  ) {
    super(message, 403, 'FORBIDDEN');
    this.name = 'Forbidden';
  }

}
