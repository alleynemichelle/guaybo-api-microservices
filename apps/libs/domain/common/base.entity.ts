import { Status } from 'apps/libs/common/enums/status.enum';
import { IsArray, IsDateString, IsEnum, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { Tag } from './tag.entity';

export interface BaseData {
    id?: number;
    recordId?: string;
}

export class Base {
    @IsOptional()
    @IsNumber()
    id?: number;

    @IsOptional()
    @IsString()
    PK?: string;

    @IsOptional()
    @IsString()
    SK?: string;

    @IsOptional()
    @IsDateString()
    createdAt?: string;

    @IsOptional()
    @IsDateString()
    updatedAt?: string;

    @IsOptional()
    @IsString()
    recordId?: string;

    @IsOptional()
    @IsEnum(Status)
    recordStatus?: Status;

    @IsOptional()
    @IsString()
    recordType?: string;

    @IsOptional()
    @IsString()
    alias?: string;

    @IsObject()
    @IsOptional()
    customAttributes?: {
        [key: string]: {
            icon?: string;
            key?: string;
            label?: string;
            type?: string;
            value: any;
        };
    };

    @IsArray()
    @IsOptional()
    tags?: Tag[];
}
