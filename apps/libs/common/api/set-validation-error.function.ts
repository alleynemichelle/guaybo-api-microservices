import { ResponseDto } from './response.entity';

interface ValidationError {
    constraints?: Record<string, string>;
    children?: ValidationError[];
    property?: string;
    value?: any;
}

interface FormattedError {
    field: string;
    messages: string[];
    children?: FormattedError[];
}

export function setValidationError(errors: ValidationError[]): ResponseDto {
    try {
        const formatError = (error: ValidationError): FormattedError => {
            const messages: string[] = [];

            if (error.constraints) {
                messages.push(...Object.values(error.constraints));
            }

            const children: FormattedError[] = [];
            if (error.children) {
                error.children.forEach((child) => {
                    const formattedChild = formatError(child);
                    if (
                        formattedChild.messages.length > 0 ||
                        (formattedChild.children && formattedChild.children.length > 0)
                    ) {
                        children.push(formattedChild);
                    }
                });
            }

            return {
                field: error.property || 'unknown',
                messages,
                children: children.length > 0 ? children : undefined,
            };
        };

        const formattedErrors = errors.map(formatError);

        return new ResponseDto('error', 400, 'Validation Error', { errors: formattedErrors });
    } catch (err) {
        return new ResponseDto('error', 400, 'BadRequest', { message: 'Please, check the data sent.' });
    }
}
