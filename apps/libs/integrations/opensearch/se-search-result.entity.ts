import { IsArray, IsBoolean, IsNumber } from 'class-validator';

export class SEResult {
    @IsBoolean()
    timedOut: number;
    @IsNumber()
    time: number;

    @IsArray()
    hits: any[];

    @IsArray()
    aggregations?: any[];

    @IsNumber()
    total: number;
}
