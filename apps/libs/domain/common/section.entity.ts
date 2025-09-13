import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNumber, IsString, ValidateNested } from 'class-validator';
import { SectionFormat } from 'apps/libs/common/enums/section-format.enum';

import { Item } from './item.entity';

export class Section {
    @IsEnum(SectionFormat)
    format: SectionFormat;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Item)
    items: Item[];

    @IsNumber()
    position: number;

    @IsString()
    section: string;
}
