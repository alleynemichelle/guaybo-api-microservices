import { AmountType } from 'apps/libs/common/enums/amount-type.enum';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class Breakdown {
    @IsString()
    key: string;

    @IsEnum(AmountType)
    type: AmountType;

    @IsNumber()
    amount: number;

    @IsOptional()
    @IsNumber()
    calculatedAmount?: number;
}
