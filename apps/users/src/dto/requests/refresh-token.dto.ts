import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'Refresh Token',
        example: 'eyJraWQiOiJ0azVVak4yNHJQOUtEbTZOe...',
        type: String,
    })
    refreshToken: string;
}
