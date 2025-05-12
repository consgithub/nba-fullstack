import { Request } from 'express';
import { AuthPayload } from './shots';

export interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
}