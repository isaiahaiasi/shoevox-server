/* eslint-disable @typescript-eslint/no-unused-vars */
import * as express from 'express';
import { Express } from 'express-serve-static-core';

declare global {
  namespace Express {
    interface User {
      id: string;
    }
  }
}
