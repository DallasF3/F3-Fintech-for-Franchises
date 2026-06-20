import { Request, Response, NextFunction } from 'express';
import { logger } from '../shared/logger';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  // Log the error
  logger.error({
    err,
    req: {
      method: req.method,
      url: req.url,
      body: req.body,
      query: req.query,
      params: req.params,
    },
  });

  const statusCode = err.status || err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
    code: err.code,
    ...(isProduction ? {} : { stack: err.stack }),
  });
}
