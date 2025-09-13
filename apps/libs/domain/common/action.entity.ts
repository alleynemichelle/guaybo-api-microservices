import { IsString, IsUrl, IsIn, IsOptional } from 'class-validator';

export class Action {
    @IsString()
    @IsIn(['link', 'email', 'whatsapp'])
    type: string;

    @IsString()
    label: string;

    @IsString()
    value: string;

    @IsString()
    @IsOptional()
    icon?: string;
}
