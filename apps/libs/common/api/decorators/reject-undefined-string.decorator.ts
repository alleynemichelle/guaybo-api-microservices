import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

/**
 * Decorator that validates if a string is not literally 'undefined'
 * @param validationOptions Additional validation options
 */
export function RejectUndefinedString(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'rejectUndefinedString',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    if (typeof value !== 'string') return true;
                    return value !== 'undefined';
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} cannot be the string 'undefined'`;
                },
            },
        });
    };
}
