import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class PutPaymentOptionsDto {
    @ApiProperty({
        description: 'Payment method record ID',
        example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    })
    @IsString()
    @IsNotEmpty()
    recordId: string;

    @ApiProperty({
        description: 'Payment method name',
        example: 'Credit Card',
    })
    @IsString()
    @IsNotEmpty()
    name: string;
}
