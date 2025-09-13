import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { LabelValue } from './label-value.entity';

export class CustomMessage {
    @IsString()
    @IsNotEmpty()
    content: string;

    @IsArray()
    @ValidateNested({ each: true })
    @ArrayMinSize(1)
    @Type(() => LabelValue)
    variables: LabelValue[];
}
