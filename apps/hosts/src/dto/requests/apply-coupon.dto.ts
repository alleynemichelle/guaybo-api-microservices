import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ApplyCouponDto {
    @ApiProperty({ description: 'Coupon code to apply', example: 'GUAYABITO2025' })
    @IsNotEmpty()
    @IsString()
    code: string;
}
