import { Injectable, NestMiddleware } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class FileStorageMiddleware implements NestMiddleware {
  constructor() {}

  async use(req, res, next) {
    next();
  }
}
