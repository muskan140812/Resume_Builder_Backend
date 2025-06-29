import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    statusCode = 400;
    const errors: { [key: string]: string } = {};
    
    Object.keys(error.errors).forEach((key) => {
      errors[key] = error.errors[key].message;
    });
    
    return res.status(statusCode).json({
      success: false,
      error: 'Validation Error',
      errors,
    });
  }

  // Mongoose duplicate key error
  if (error.code === 11000) {
    statusCode = 400;
    const field = Object.keys(error.keyValue)[0];
    message = `${field} already exists`;
    
    return res.status(statusCode).json({
      success: false,
      error: message,
    });
  }

  // Mongoose cast error
  if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
    
    return res.status(statusCode).json({
      success: false,
      error: message,
    });
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    
    return res.status(statusCode).json({
      success: false,
      error: message,
    });
  }

  if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    
    return res.status(statusCode).json({
      success: false,
      error: message,
    });
  }

  // Multer file upload errors
  if (error.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'File too large';
    
    return res.status(statusCode).json({
      success: false,
      error: message,
    });
  }

  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    message = 'Too many files or unexpected field name';
    
    return res.status(statusCode).json({
      success: false,
      error: message,
    });
  }

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', error);
  }

  return res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
}; 