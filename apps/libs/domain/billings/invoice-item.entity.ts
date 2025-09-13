import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Discount } from '../bookings/discount.entity';

export class InterestItem {
    @IsNumber()
    amount: number;

    @IsNumber()
    calculatedAmount?: number;

    @IsString()
    key: string;

    @IsString()
    type: string;
}

export class InvoiceItem {
    @IsNumber()
    total: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Discount || InterestItem)
    items: Discount[] | InterestItem[];
}
