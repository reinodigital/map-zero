import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch() // This decorator makes it catch all unhandled exceptions
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? (exception.getResponse() as any).message || exception.message
        : `Internal server error from PATH: ${request.url}`;

    // // Log the error for debugging purposes (consider using a dedicated logger like Winston or Pino)
    // console.error(
    //   `[${new Date().toISOString()}] ${request.method} ${request.url}`,
    //   `Status: ${status}`,
    //   `Error: ${message}`,
    //   exception, // Log the full exception object for more details
    // );

    response.status(status).json({
      statusCode: status,
      message: Array.isArray(message) ? message.join(', ') : message, // Handle class-validator errors
      path: request.url,
    });
  }
}
