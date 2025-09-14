import { ApiProperty } from '@nestjs/swagger';
import { ResponseDto } from 'apps/libs/common/api/response.entity';

class CouponDurationDto {
    @ApiProperty({ example: 'MM' })
    unit: string;

    @ApiProperty({ example: 1 })
    quantity: number;
}

export class AppliedCouponDto {
    @ApiProperty({ example: '500012394' })
    recordId: string;

    @ApiProperty({ example: 'QUIEROVENDER' })
    name: string;

    @ApiProperty({ example: '50% de descuento en comisiones por el primer mes' })
    description: string;

    @ApiProperty({ example: 5000 })
    amount: number;

    @ApiProperty({ example: 'PERCENTAGE' })
    type: string;

    @ApiProperty({ example: 'TOTAL' })
    scope: string;

    @ApiProperty({ example: 'ACTIVE' })
    status: string;

    @ApiProperty({ example: '2025-07-12T21:23:24.120Z', nullable: true })
    validUntil?: Date;

    @ApiProperty({ example: '2025-06-12T21:23:24.120Z', nullable: true })
    validFrom?: Date;

    @ApiProperty({ example: 'QUIEROVENDER', nullable: true })
    code?: string;

    @ApiProperty({ type: CouponDurationDto, required: false })
    duration?: CouponDurationDto;
}

export class ApplyCouponResponseDto extends ResponseDto {
    @ApiProperty({
        type: AppliedCouponDto,
        example: {
            recordId: 500012394,
            name: 'QUIEROVENDER',
            description: '50% de descuento en comisiones por el primer mes',
            amount: 5000,
            type: 'PERCENTAGE',
            scope: 'TOTAL',
            status: 'ACTIVE',
            validUntil: '2025-07-12T21:23:24.120Z',
            validFrom: '2025-06-12T21:23:24.120Z',
            code: 'QUIEROVENDER',
            duration: {
                unit: 'MM',
                quantity: 1,
            },
        },
    })
    data: AppliedCouponDto;
}
