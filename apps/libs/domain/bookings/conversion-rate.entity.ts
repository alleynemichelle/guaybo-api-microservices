import { IsNumber, IsString } from 'class-validator';

export class ConversionRate {
    @IsNumber()
    amount: number;

    @IsString()
    currency: string;

    @IsString()
    updatedAt: string;
}
