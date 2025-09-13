import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString, IsTimeZone } from 'class-validator';

export class SingleDate {
    @ApiProperty({
        description: 'Date in ISO format',
        example: '2025-02-12T14:00:00',
    })
    @IsDateString()
    @IsNotEmpty()
    date: string;

    @ApiPropertyOptional({
        description: 'Time (if not provided, will use 00:00)',
        example: '14:00',
    })
    @IsString()
    @IsOptional()
    time?: string;

    @ApiProperty({
        description: 'Timezone',
        example: 'America/Caracas',
    })
    @IsTimeZone()
    @IsNotEmpty()
    timezone: string = 'UTC';
}
