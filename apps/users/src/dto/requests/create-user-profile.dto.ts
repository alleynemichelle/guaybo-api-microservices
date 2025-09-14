import { ApiProperty } from '@nestjs/swagger';
import { PhoneNumber } from 'apps/libs/domain/common/phone-number.entity';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, IsTimeZone, ValidateNested } from 'class-validator';

export class CreateUserProfileDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'First name of the user',
        example: 'John',
        type: String,
    })
    firstName: string;

    @IsOptional()
    @IsString()
    @ApiProperty({
        description: 'Last name of the user',
        example: 'Doe',
        type: String,
    })
    lastName?: string;

    @ApiProperty({
        description: 'Timezone of the user.',
        example: 'America/Caracas',
        type: String,
    })
    @IsTimeZone()
    timezone: string;

    @ApiProperty({
        description: 'Phone number of the host.',
        example: { code: '+58', number: '4142312123' },
        required: false,
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => PhoneNumber)
    phoneNumber?: PhoneNumber;

    federated?: boolean;

    constructor(
        firstName: string,
        lastName: string,
        email: string,
        timezone: string,
        federated?: boolean,
        phoneNumber?: PhoneNumber,
    ) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.timezone = timezone;
        this.federated = federated;
        this.phoneNumber = phoneNumber;
    }
}
