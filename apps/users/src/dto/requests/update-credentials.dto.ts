import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsNotEmpty, IsEmail, ValidateNested, IsOptional } from 'class-validator';
import { ChangePasswordDto } from './change-password.dto';
import { ResetPasswordDto } from './reset-password.dto';

export class UpdateCredentialsDto {
    @IsNotEmpty()
    @IsEmail()
    @Transform(({ value }) => value.toLowerCase())
    @ApiProperty({
        description: 'Email address of the user',
        example: 'john.doe@example.com',
        type: String,
    })
    email: string;

    @ApiProperty({
        description: 'Change password operation parameters. User must be logged',
        type: ChangePasswordDto,
        required: false,
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => ChangePasswordDto)
    changePassword?: ChangePasswordDto;

    @ApiProperty({
        description: 'Reset password operation parameters',
        type: ResetPasswordDto,
        required: false,
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => ResetPasswordDto)
    resetPassword?: ResetPasswordDto;
}
