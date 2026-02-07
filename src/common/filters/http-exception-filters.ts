import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
  import { Request, Response } from 'express';
import { ApiErrorResponse } from '../interfaces';
  
  @Catch()
  export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();
  
      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      let message = 'Internal server error';
      let details: any = null;
  
      if (exception instanceof HttpException) {
        status = exception.getStatus();
        const res = exception.getResponse();
  
        if (typeof res === 'string') {
          message = res;
        } else {
          message = (res as any).message || message;
          details = (res as any).errors || (res as any);
        }
      }
  
      const errorResponse: ApiErrorResponse = {
        success: false,
        message,
        error: {
          code: status,
          details,
        },
        meta: {
          timestamp: new Date().toISOString(),
          path: request.url,
        },
      };
  
      response.status(status).json(errorResponse);
    }
  }
  