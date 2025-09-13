import { Logger } from '@nestjs/common';

/**
 * Decorator that measures the execution time of a method and logs it
 * @param description Optional description for the timing log
 */
export function Timer(description?: string) {
    return function (target: object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) {
        const originalMethod = descriptor.value;
        const className = target.constructor.name;
        const methodName = propertyKey.toString();

        descriptor.value = async function (...args: any[]) {
            const startTime = performance.now();

            try {
                const result = await originalMethod.apply(this, args);

                const endTime = performance.now();
                const executionTime = endTime - startTime;

                const logMessage = description
                    ? `${description}: ${executionTime.toFixed(2)}ms`
                    : `${className}.${methodName} executed in ${executionTime.toFixed(2)}ms`;

                Logger.log(logMessage, 'Timer');

                return result;
            } catch (error: unknown) {
                const endTime = performance.now();
                const executionTime = endTime - startTime;

                const errorMessage = error instanceof Error ? error.message : String(error);

                Logger.warn(
                    `${className}.${methodName} failed after ${executionTime.toFixed(2)}ms: ${errorMessage}`,
                    'Timer',
                );

                throw error;
            }
        };

        return descriptor;
    };
}
