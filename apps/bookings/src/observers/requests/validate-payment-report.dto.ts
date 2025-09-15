import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentProcessorType } from 'apps/libs/common/enums/payment-processor-type.enum';
import { MobilePaymentDataDto } from './create-payment.dto';

export class ValidatePaymentReportDto {
    @ApiProperty({
        description: 'Type of payment processor to validate (should match the original payment)',
        enum: PaymentProcessorType,
        example: PaymentProcessorType.AUTOMATIC_MOBILE_PAYMENT,
    })
    @IsEnum(PaymentProcessorType)
    processorType: PaymentProcessorType;

    @ApiProperty({
        description: 'Mobile payment data to validate',
        type: MobilePaymentDataDto,
        example: {
            phoneNumber: { code: '58', number: '4141234567' },
            nationalId: { type: 'V', number: '12345678' },
            bank: '0134',
            amount: 100,
            date: '2025-01-20',
        },
    })
    @ValidateNested()
    @Type(() => MobilePaymentDataDto)
    mobilePaymentData: MobilePaymentDataDto;

    @ApiProperty({
        description: 'Reference code from the original payment (optional)',
        example: 'REF123456',
        required: false,
    })
    @IsString()
    referenceCode?: string;
}
