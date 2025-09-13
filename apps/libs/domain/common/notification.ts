import { IsEmail, IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class Notification {
    @IsOptional()
    templateId?: string;

    @IsEmail({}, { each: true })
    @IsNotEmpty()
    to: string | string[];

    @IsString()
    @IsOptional()
    from?: string;

    @IsString()
    @IsNotEmpty()
    subject: string;

    @IsOptional()
    dynamicData?: Record<string, any>;

    @IsString()
    @IsOptional()
    html?: string;
}
