import { IsObject, IsString } from 'class-validator';

export class LabelValue {
    @IsString()
    label: string;

    @IsObject()
    value?: any;

    @IsString()
    key?: string;

    @IsString()
    location?: string;
}
