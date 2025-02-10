import { HttpStatus } from '@nestjs/common';
import { Response } from 'express';

const sendResponse = (
  response: Response,
  statusCode: HttpStatus,
  message: string | null,
  metadata: any,
  error: any,
) => {
  return response.status(statusCode).json({
    statusCode,
    message,
    metadata,
    error,
  });
};

export default sendResponse;
