import { IsOptional, IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentStatus } from 'apps/libs/common/enums/payment-status.enum';

export class UpdatePaymentDto {
    @ApiProperty({
        description: 'New booking status',
        example: PaymentStatus.CONFIRMED,
        required: false,
    })
    @IsOptional()
    @IsEnum(PaymentStatus)
    paymentStatus?: PaymentStatus;

    @ApiProperty({
        description: 'Host message associated to the payment.',
        example: 'Payment can not be confirmed',
        required: false,
    })
    @IsOptional()
    @IsString()
    message?: string;
}
