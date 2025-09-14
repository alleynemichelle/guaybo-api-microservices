import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PhoneNumber } from 'apps/libs/domain/common/phone-number.entity';
import { Language } from 'apps/libs/common/enums/language.enum';

export class UpdateUserDto {
    @ApiProperty({
        description: 'User first name',
        example: 'John',
    })
    @IsString()
    @IsOptional()
    firstName?: string;

    @ApiProperty({
        description: 'User last name',
        example: 'Doe',
    })
    @IsString()
    @IsOptional()
    lastName?: string;

    @ApiProperty({
        description: 'User phone number',
        example: { code: '+58', number: '4121234567' },
        type: PhoneNumber,
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => PhoneNumber)
    phoneNumber?: PhoneNumber;

    @ApiProperty({
        description: 'User Instagram account',
        example: '@johndoe',
    })
    @IsString()
    @IsOptional()
    instagramAccount?: string;

    @ApiProperty({
        description: 'User default language',
        example: 'ES',
        enum: Language,
    })
    @IsString()
    @IsEnum(Language)
    @IsOptional()
    defaultLanguage?: string;
}
