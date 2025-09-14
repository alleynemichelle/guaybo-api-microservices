import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString, MaxLength, MinLength } from 'class-validator';

export class ConfirmAccountDto {
    @IsNotEmpty()
    @IsNumberString()
    @ApiProperty({
        description: 'Confirmation code for account verification',
        example: '123456',
        type: String,
    })
    @MaxLength(6)
    @MinLength(6)
    code: string;
}
