declare namespace Express {
  interface Request {
    user: {
      _id: unknown;
      username: string;
    };
  }
}

import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: string | JwtPayload;
    }
  }
}
