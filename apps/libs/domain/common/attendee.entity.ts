import { IsEmail, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PhoneNumber } from './phone-number.entity';
import { Base } from './base.entity';

export class Attendee extends Base {
    @IsOptional()
    @IsEmail()
    email: string;

    @IsString()
    firstName?: string;

    @IsString()
    lastName?: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => PhoneNumber)
    phoneNumber?: PhoneNumber;

    @IsOptional()
    @IsString()
    instagramAccount?: string;
}
