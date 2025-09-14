import { ApiProperty } from '@nestjs/swagger';
import { TemporalTokenType } from 'apps/libs/common/enums/temporal-token-type.enum';
import { IsString, IsNotEmpty, IsEmail, IsEnum } from 'class-validator';

/**
 * DTO for sending temporal tokens via email
 */
export class SendTemporalTokenDto {
    @ApiProperty({
        description: 'User ID for the temporal token',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsNotEmpty()
    @IsString()
    userId: string;

    @ApiProperty({
        description: 'Email address for the temporal token',
        example: 'user@example.com',
    })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'Type of temporal token',
        enum: TemporalTokenType,
        example: TemporalTokenType.COMPLETE_REGISTRATION,
    })
    @IsNotEmpty()
    @IsEnum(TemporalTokenType)
    tokenType: TemporalTokenType;
}
