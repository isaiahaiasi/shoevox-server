/* eslint-disable @typescript-eslint/no-unused-vars */
import { Express } from 'express-serve-static-core';

export { };

declare global {
  namespace Express {
    interface User {
      id: string;
    }
  }
}

declare module 'express-serve-static-core' {
  interface User {
    id: string;
  }
}
