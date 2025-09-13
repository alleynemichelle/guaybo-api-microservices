import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsArray,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsString,
    ValidateNested,
    IsOptional,
    IsDateString,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AmountType } from 'apps/libs/common/enums/amount-type.enum';
import { DiscountStatus } from 'apps/libs/common/enums/discount-status.enum';
import { DiscountScope } from 'apps/libs/common/enums/discount-scope.enum';
import { getUTCDate } from 'apps/libs/common/utils/date';

import { Base } from '../common/base.entity';
import { Condition } from '../common/condition.entity';
import { ValueItem } from '../common/value-item.entity';

export class Discount extends Base {
    @ApiProperty({
        description: 'The amount of the discount',
        example: 20,
    })
    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @ApiProperty({
        description: 'The type of the discount amount',
        enum: AmountType,
        example: AmountType.PERCENTAGE,
    })
    @IsNotEmpty()
    @IsEnum(AmountType)
    type: AmountType;

    @ApiProperty({
        description: 'The scope of the discount',
        enum: DiscountScope,
        example: DiscountScope.TOTAL,
    })
    @IsNotEmpty()
    @IsEnum(DiscountScope)
    scope: DiscountScope;

    @ApiProperty({
        description: 'Name of the discount',
        example: 'Promoción semana santa.',
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiPropertyOptional({
        description: 'A description of the discount',
        example: '20% off on total price',
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({
        description: 'Conditions that must be met for the discount to apply',
        type: [Condition],
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Condition)
    conditions?: Condition[];

    @ApiPropertyOptional({
        description: 'The status of the discount',
        enum: DiscountStatus,
        example: DiscountStatus.ACTIVE,
    })
    @IsOptional()
    @IsEnum(DiscountStatus)
    discountStatus?: DiscountStatus;

    @ApiPropertyOptional({
        description: 'The date from which the discount is valid (ISO format)',
        example: '2025-01-01',
    })
    @IsOptional()
    @IsDateString()
    validFrom?: string;

    @ApiPropertyOptional({
        description: 'The date until which the discount is valid (ISO format)',
        example: '2025-12-31',
    })
    @IsOptional()
    @IsDateString()
    validUntil?: string;

    @ApiPropertyOptional({
        description: 'A code required to apply the discount',
        example: 'SUMMER2025',
    })
    @IsOptional()
    @IsString()
    code?: string;

    @ApiPropertyOptional({
        description:
            'This is the total number of bookings allowed for a discount code, for example, it can only be used by 100 people.',
        example: 100,
    })
    @IsOptional()
    @IsNumber()
    @Min(1)
    maxCapacity?: number;

    @ApiPropertyOptional({
        description: 'Duration of the discount',
        type: ValueItem,
        example: { quantity: '1', unit: 'MM' },
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => ValueItem)
    duration?: ValueItem;

    @ApiPropertyOptional({
        description: 'The total number of bookings allowed for a discount code',
        example: 100,
    })
    @IsOptional()
    @IsNumber()
    totalBookings?: number;

    static isActive(discount: Discount): boolean {
        const now = getUTCDate();

        if (discount.discountStatus === DiscountStatus.INACTIVE) {
            return false;
        }

        if (discount.validFrom) {
            const validFromDate = new Date(discount.validFrom);
            if (now < validFromDate) {
                return false;
            }
        }

        if (discount.validUntil) {
            const validUntilDate = new Date(discount.validUntil);
            if (now > validUntilDate) {
                return false;
            }
        }

        return true;
    }
}

export class DiscountCode extends Discount {}
