import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { ApiResponse } from "../interfaces/api-response-interface";
import {map} from 'rxjs/operators'

@Injectable()

export class ResponseInterceptor<T> 
    implements NestInterceptor<T, ApiResponse<T>> 
{
    intercept(context: ExecutionContext, next: CallHandler) {
        return next.handle().pipe(
            map((response) => {
                return {
                    success: true,
                    data: response?.data || response,
                    message: response?.message,
                    meta: {
                        timestamp: new Date().toISOString(),
                        ...(response?.meta || {})
                    },
                }
            })
        )
    }
}