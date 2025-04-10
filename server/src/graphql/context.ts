import type { JwtPayload } from 'jsonwebtoken';

export interface Context {
  user?: JwtPayload & { _id: string }; // Extend JwtPayload with _id
}