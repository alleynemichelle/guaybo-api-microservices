import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsEmail, IsStrongPassword, IsString, IsTimeZone, IsOptional } from 'class-validator';

export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'First name of the user',
        example: 'John',
        type: String,
    })
    firstName: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'Last name of the user',
        example: 'Doe',
        type: String,
    })
    lastName: string;

    @IsNotEmpty()
    @IsEmail()
    @Transform(({ value }) => value.toLowerCase())
    @ApiProperty({
        description: 'Email address of the user',
        example: 'john.doe@example.com',
        type: String,
    })
    email: string;

    @IsNotEmpty()
    @IsStrongPassword({
        minLength: 8,
        minNumbers: 1,
        minSymbols: 1,
        minUppercase: 0,
        minLowercase: 0,
    })
    @ApiProperty({
        description: 'Password of the user',
        example: 'Password123%',
        type: String,
    })
    password: string;

    @ApiProperty({
        description: 'Timezone of the user.',
        example: 'America/Caracas',
        type: String,
    })
    @IsTimeZone()
    timezone: string;

    @ApiPropertyOptional({
        description: 'Referral code of the user',
        example: 'CODE_111',
        type: String,
    })
    @IsOptional()
    @IsString()
    referralCode?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({
        description: 'UTM source of the user',
        example: 'facebook',
        type: String,
    })
    utmSource?: string;

    federated?: boolean;

    constructor(
        firstName: string,
        lastName: string,
        email: string,
        password: string,
        timezone: string,
        federated?: boolean,
        referralCode?: string,
        utmSource?: string,
    ) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.timezone = timezone;
        this.federated = federated;
        this.referralCode = referralCode;
        this.utmSource = utmSource;
    }
}
