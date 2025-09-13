import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class RequestLoggerInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        // Log endpoint, method, parameters, and body
        const request = context.switchToHttp().getRequest();

        const endpoint = request.url;
        const method = request.method;
        const params = request.params;
        const query = request.query;
        const body = request.body;

        console.log(`Calling Endpoint: ${method} ${endpoint}`);
        console.log('Parameters:', params);
        console.log('Query:', query);
        console.log('Body:', body);

        return next.handle();
    }
}
