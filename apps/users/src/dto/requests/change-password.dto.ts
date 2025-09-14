import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsStrongPassword, IsString } from 'class-validator';

export class ChangePasswordDto {
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
    @IsString()
    @ApiProperty({
        description: 'Old password of the user (Only required if user is authenticated)',
        example: 'Password123%',
        type: String,
    })
    oldPassword: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'Access Token (Only required if user is authenticated)',
        example: 'eyJraWQiOiJ0azVVak4yNHJQOUtEbTZOe...',
        type: String,
    })
    accessToken: string;
}
