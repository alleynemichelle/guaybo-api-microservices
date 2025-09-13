import { IsOptional, IsString } from 'class-validator';

export class Item {
    @IsString()
    @IsOptional()
    caption?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    icon?: string;
}
