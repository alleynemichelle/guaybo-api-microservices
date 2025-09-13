import { IsOptional, IsString } from 'class-validator';

import { Base } from './base.entity';

export class Template extends Base {
    @IsString()
    name: string;

    @IsString()
    subject: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    html: string;

    @IsString()
    text: string;
}
