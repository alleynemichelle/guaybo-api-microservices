import { Injectable, NestInterceptor, ExecutionContext, CallHandler, BadRequestException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class ValidateUndefinedStringsInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        if (request.body && typeof request.body === 'object') {
            this.validateObject(request.body);
        }
        return next.handle();
    }

    private validateObject(obj: any, path: string = '') {
        if (!obj || typeof obj !== 'object') return;

        for (const [key, value] of Object.entries(obj)) {
            const currentPath = path ? `${path}.${key}` : key;

            if (typeof value === 'string' && value === 'undefined') {
                throw new BadRequestException({
                    status: 'error',
                    code: 400,
                    message: `BadRequest`,
                    data: {},
                });
            }

            // Recursively validate nested objects and arrays
            if (value && typeof value === 'object') {
                if (Array.isArray(value)) {
                    value.forEach((item, index) => {
                        this.validateObject(item, `${currentPath}[${index}]`);
                    });
                } else {
                    this.validateObject(value, currentPath);
                }
            }
        }
    }
}
