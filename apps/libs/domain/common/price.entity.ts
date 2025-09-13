import { ApiProperty } from '@nestjs/swagger';

import { IsNumber, IsString } from 'class-validator';
import { FareType } from 'apps/libs/common/enums/fare-type.enum';
import { PricingModelEnum } from 'apps/libs/common/enums/pricing-model.enum';

export class Price {
    @ApiProperty({
        description: 'The amount of the price',
        example: 100,
    })
    @IsNumber()
    amount: number;

    @ApiProperty({
        description: 'Currency of the price',
        example: 'USD',
    })
    @IsString()
    currency: string;

    @ApiProperty({
        description: 'Type of fare',
        enum: FareType,
        example: FareType.GENERAL,
    })
    @IsString()
    fareType: FareType;

    @ApiProperty({
        description: 'Pricing model for the product',
        enum: PricingModelEnum,
        example: PricingModelEnum.PER_PERSON,
    })
    @IsString()
    pricingModel: PricingModelEnum;

    @ApiProperty({
        description: 'Symbol of the currency',
        example: '$',
    })
    @IsString()
    symbol: string;
}
