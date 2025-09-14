import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsStrongPassword, IsNumberString } from 'class-validator';

export class ResetPasswordDto {
    @IsNotEmpty()
    @IsStrongPassword({
        minLength: 8,
        minNumbers: 1,
        minSymbols: 1,
        minUppercase: 0,
        minLowercase: 0,
    })
    @ApiProperty({
        description: 'New password of the user',
        example: 'NewPassword123%',
        type: String,
    })
    newPassword: string;

    @IsNotEmpty()
    @IsNumberString()
    @ApiProperty({
        description: 'Code for password reset (Only required if user is not authenticated)',
        example: '123456',
        type: String,
    })
    code: string;
}
