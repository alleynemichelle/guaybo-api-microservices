import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class CreateSessionDto {
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
    @IsString()
    @ApiProperty({
        description: 'Password of the user',
        example: 'Password123%',
        type: String,
    })
    password: string;
}
