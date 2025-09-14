import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LogOutDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'Access Token',
        example: 'eyJraWQiOiJ0azVVak4yNHJQOUtEbTZOe...',
        type: String,
    })
    accessToken: string;
}
