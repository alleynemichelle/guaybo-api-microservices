import { ApiProperty } from '@nestjs/swagger';
import {
    IsNumber,
    IsOptional,
    IsString,
    Min,
    IsEnum,
    ValidateNested,
    Matches,
    ValidateIf,
    registerDecorator,
    ValidationOptions,
    ValidationArguments,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentProcessorType } from 'apps/libs/common/enums/payment-processor-type.enum';
import { PhoneNumber } from 'apps/libs/domain/common/phone-number.entity';
import { NationalId } from 'apps/libs/domain/common/national-id.entity';

// Custom validator to check if mobile payment amount matches main payment amount
export function IsMobilePaymentAmountValid(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isMobilePaymentAmountValid',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const obj = args.object as any;
                    if (obj.processorType === PaymentProcessorType.AUTOMATIC_MOBILE_PAYMENT && obj.mobilePaymentData) {
                        return obj.amount === obj.mobilePaymentData.amount;
                    }
                    return true; // Skip validation if not automatic mobile payment
                },
                defaultMessage(args: ValidationArguments) {
                    return 'Mobile payment amount must match the main payment amount';
                },
            },
        });
    };
}

export class MobilePaymentDataDto {
    @ApiProperty({
        description: 'Phone number for mobile payment',
        type: PhoneNumber,
        example: { code: '58', number: '4141234567' },
    })
    @ValidateNested()
    @Type(() => PhoneNumber)
    phoneNumber: PhoneNumber;

    @ApiProperty({
        description: 'National ID of the person making the payment',
        type: NationalId,
        example: { type: 'V', number: '12345678' },
    })
    @ValidateNested()
    @Type(() => NationalId)
    nationalId: NationalId;

    @ApiProperty({
        description: 'Bank code (4 digits) - e.g., "0134" for Banesco, "0102" for Banco de Venezuela',
        example: '0134',
    })
    @IsString()
    @Matches(/^\d{4}$/, { message: 'Bank code must be exactly 4 digits' })
    bank: string;

    @ApiProperty({
        description: 'Payment date in YYYY-MM-DD format',
        example: '2025-01-20',
    })
    @IsString()
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be in YYYY-MM-DD format' })
    date: string;
}

export class CreatePaymentDto {
    @ApiProperty({
        description: 'Total amount to be paid in USD.',
        example: 15,
    })
    @IsNumber()
    @Min(0)
    amount: number;

    @ApiProperty({
        description: 'Type of payment processor to use',
        enum: PaymentProcessorType,
        example: PaymentProcessorType.MANUAL,
        required: false,
        default: PaymentProcessorType.MANUAL,
    })
    @ValidateIf((obj) => obj.amount > 0)
    @IsEnum(PaymentProcessorType)
    processorType?: PaymentProcessorType = PaymentProcessorType.MANUAL;

    @ApiProperty({
        description: 'Payment method identifier.',
        example: '12a2b109-2d43-4c42-927f-8d7ff89d5704',
        required: false,
    })
    @IsString()
    @ValidateIf((obj) => obj.amount > 0 && obj.processorType === PaymentProcessorType.MANUAL)
    paymentMethodId?: string;

    @ApiProperty({
        description: 'Payment receipt file. Not required for automatic mobile payments.',
        example: 'receipt.png',
        required: false,
    })
    @IsOptional()
    @IsString()
    paymentReceipt?: string;

    @ApiProperty({
        description: 'Reference code for the payment, used for tracking and identification',
        example: 'REF123456',
        required: false,
    })
    @IsOptional()
    @IsString()
    referenceCode?: string;

    @ApiProperty({
        description: 'Mobile payment specific data (required when processorType is AUTOMATIC_MOBILE)',
        type: MobilePaymentDataDto,
        example: {
            phoneNumber: { code: '58', number: '4141234567' },
            nationalId: { type: 'V', number: '12345678' },
            bank: '0134',
            amount: 100,
            date: '2025-06-25',
        },
        required: false,
    })
    @ValidateIf((obj) => obj.processorType === PaymentProcessorType.AUTOMATIC_MOBILE_PAYMENT)
    @ValidateNested()
    @Type(() => MobilePaymentDataDto)
    mobilePaymentData?: MobilePaymentDataDto;
}
