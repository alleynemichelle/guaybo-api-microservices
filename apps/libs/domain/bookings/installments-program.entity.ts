import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    Min,
    ValidateIf,
    ValidateNested,
} from 'class-validator';
import { AmountType } from 'apps/libs/common/enums/amount-type.enum';
import { Frequency } from 'apps/libs/common/enums/frequency.enum';
import { Condition } from '../common/condition.entity';

class InterestFee {
    @ApiProperty({
        description: 'The amount of the interest fee',
        example: 10.5,
    })
    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @ApiProperty({
        description: 'The type of the amount (FIXED or PERCENTAGE)',
        enum: AmountType,
        example: AmountType.FIXED,
    })
    @IsNotEmpty()
    @IsEnum(AmountType)
    type: AmountType;
}

export class InstallmentsProgram {
    @ApiProperty({
        description: 'Indicates if the installment program is active',
        example: true,
    })
    @IsBoolean()
    active: boolean;

    @ApiProperty({
        description: 'The initial payment amount',
        example: 100,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    initialPaymentAmount?: number;

    @ApiProperty({
        description: 'The number of installments',
        example: 3,
    })
    @ValidateIf((obj) => obj.active == true)
    @IsNotEmpty()
    @IsNumber()
    installmentsCount: number;

    @ApiProperty({
        description: 'The number of days before the event to make the payment',
        example: 7,
        required: false,
    })
    @IsOptional()
    @IsInt()
    @Min(0)
    paymentDeadlineDaysBeforeEvent?: number;

    @ApiProperty({
        description: 'The number of days after the event to make the payment',
        example: 14,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    paymentDeadlineDaysAfterEvent?: number;

    @ApiProperty({
        description: 'The frequency of the installments',
        enum: Frequency,
        example: Frequency.MONTHLY,
    })
    @IsNotEmpty()
    @IsEnum(Frequency, { each: true })
    frequency: Frequency;

    @ApiProperty({
        description: 'The interest fee details',
        type: InterestFee,
        required: false,
    })
    @ValidateNested({ each: true })
    @Type(() => InterestFee)
    interestFee?: InterestFee;

    @ApiPropertyOptional({
        description: 'Conditions that must be met for the installment program to apply',
        type: [Condition],
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Condition)
    conditions?: Condition[];
}
