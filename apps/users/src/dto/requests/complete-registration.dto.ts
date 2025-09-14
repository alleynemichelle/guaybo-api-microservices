import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsStrongPassword } from 'class-validator';

export class CompleteRegistrationDto {
    @IsNotEmpty()
    @IsStrongPassword({
        minLength: 8,
        minNumbers: 1,
        minSymbols: 1,
        minUppercase: 0,
        minLowercase: 0,
    })
    @ApiProperty({
        description: 'New password for the user',
        example: 'NewPassword123%',
        type: String,
    })
    password: string;
}
