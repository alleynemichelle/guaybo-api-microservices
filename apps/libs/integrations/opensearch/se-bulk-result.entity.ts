import { IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class SEBulkResult {
    @IsOptional()
    @IsNumber()
    total?: number;

    @IsOptional()
    @IsNumber()
    failed?: number;

    @IsOptional()
    @IsNumber()
    retry?: number;

    @IsOptional()
    @IsNumber()
    successful?: number;

    @IsOptional()
    @IsNumber()
    time?: number;

    @IsOptional()
    @IsNumber()
    bytes?: number;

    @IsOptional()
    @IsBoolean()
    aborted?: boolean;
}
