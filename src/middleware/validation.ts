import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const errorMessages: { [key: string]: string } = {};
  
  errors.array().forEach((error: any) => {
    if (error.path) {
      errorMessages[error.path] = error.msg;
    }
  });

  return res.status(400).json({
    success: false,
    error: 'Validation failed',
    errors: errorMessages,
  });
}; 