import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let error: string | null = 'Internal server error';
    let messages: string[] = [];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseMessage = (exceptionResponse as any).message;
        const responseError = (exceptionResponse as any).error;

        if (Array.isArray(responseMessage)) {
          messages = responseMessage;
        } else {
          messages = [responseMessage || responseError || error];
        }

        error = responseError || error;
      }
    } else if (typeof exception === 'string') {
      error = exception;
      messages = [exception];
    } else if (exception instanceof Error) {
      error = exception.message;
      messages = [exception.message];
    }

    // Log the exception for debugging purposes
    console.error('Unhandled Exception:', exception);

    response.status(status).json({
      statusCode: status,
      messages,
      metadata: null,
      error,
    });
  }
}
