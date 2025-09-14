import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class ProductAccessResponseDto {
    @ApiProperty({
        description: 'Indicates if the access was granted successfully',
        example: true,
    })
    @IsBoolean()
    success: boolean;

    @ApiProperty({
        description: 'Expiration time of the access in minutes',
        example: 60,
    })
    @IsNumber()
    expiresInMinutes: number;

    @ApiProperty({
        description: 'Message describing the result',
        example: 'Access granted to product resources',
    })
    @IsString()
    message: string;

    @ApiProperty({
        description: 'Timestamp when the access expires (ISO string)',
        example: '2024-01-15T10:30:00.000Z',
    })
    @IsString()
    @IsOptional()
    expiresAt?: string;
}
