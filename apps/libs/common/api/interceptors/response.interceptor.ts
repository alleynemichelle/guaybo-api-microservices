import { CallHandler, ExecutionContext, HttpException, Injectable, NestInterceptor } from '@nestjs/common';
import { ResponseDto } from 'apps/libs/common/api/response.entity';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseFormatterInterceptor implements NestInterceptor {
    // Sensitive fields that should be obfuscated in logs
    private readonly sensitiveFields = ['password', 'code', 'secret', 'token', 'key', 'authorization'];

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
        console.log('Query:', this.obfuscateSensitiveData(query));
        console.log('Body:', this.obfuscateSensitiveData(body));

        return next.handle().pipe(map((response) => this.formatResponse(response)));
    }

    private formatResponse(response: ResponseDto): ResponseDto {
        console.log('formatting response');

        if (response.status === 'error') {
            throw new HttpException(response, response.code);
        }

        response.data = response.data ?? {};
        response.data = this.cleanData(this.removeSensitiveAttributes(response.data));

        return response;
    }

    private removeSensitiveAttributes(data: any): any {
        if (Array.isArray(data)) {
            return data.map((item) => this.removeSensitiveAttributes(item));
        }

        if (data && typeof data === 'object') {
            const { PK, SK, recordType, ...rest } = data;
            Object.keys(rest).forEach((key) => {
                rest[key] = this.removeSensitiveAttributes(rest[key]);
            });

            return rest;
        }

        return data;
    }

    private cleanData(data: any): any {
        if (Array.isArray(data)) {
            return data
                .map(this.cleanData.bind(this))
                .filter(
                    (item) =>
                        item !== null &&
                        item !== undefined &&
                        !(Array.isArray(item) && item.length === 0) &&
                        !(typeof item === 'object' && Object.keys(item).length === 0),
                );
        }

        if (data && typeof data === 'object') {
            return Object.entries(data).reduce(
                (acc, [key, value]) => {
                    const cleanedValue = this.cleanData(value);

                    if (
                        cleanedValue !== null &&
                        cleanedValue !== undefined &&
                        !(Array.isArray(cleanedValue) && cleanedValue.length === 0) &&
                        !(typeof cleanedValue === 'object' && Object.keys(cleanedValue).length === 0)
                    ) {
                        acc[key] = cleanedValue;
                    }

                    return acc;
                },
                {} as Record<string, any>,
            );
        }

        return data;
    }

    /**
     * Obfuscates sensitive data in objects
     * @param data The data to obfuscate
     * @returns A copy of the data with sensitive fields obfuscated
     */
    private obfuscateSensitiveData(data: any): any {
        if (!data) return data;

        if (Array.isArray(data)) {
            return data.map((item) => this.obfuscateSensitiveData(item));
        }

        if (typeof data === 'object') {
            const result = { ...data };

            for (const key in result) {
                if (this.sensitiveFields.includes(key.toLowerCase())) {
                    result[key] = '********';
                } else if (typeof result[key] === 'object' && result[key] !== null) {
                    result[key] = this.obfuscateSensitiveData(result[key]);
                }
            }

            return result;
        }

        return data;
    }
}
