import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString } from 'class-validator';

export class RecoverPasswordDto {
    @IsNotEmpty()
    @IsNumberString()
    @ApiProperty({
        description: 'Code for password reset (Only required if user is not authenticated)',
        example: '123456',
        type: String,
    })
    code: string;
}
