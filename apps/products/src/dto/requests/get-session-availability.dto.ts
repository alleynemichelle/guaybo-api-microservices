import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString, IsTimeZone } from 'class-validator';

export class GetSessionAvailabilityDto {
    @ApiProperty({
        description: 'Start date in ISO format (YYYY-MM-DD)',
        example: '2025-01-01',
    })
    @IsDateString()
    @IsNotEmpty()
    startDate: string;

    @ApiProperty({
        description: 'End date in ISO format (YYYY-MM-DD)',
        example: '2025-01-15',
    })
    @IsDateString()
    @IsNotEmpty()
    endDate: string;

    @ApiProperty({
        description: 'Timezone for checking availability',
        example: 'America/Caracas',
        default: 'UTC',
    })
    @IsTimeZone()
    @IsOptional()
    timezone: string = 'UTC';
}

export class DayAvailability {
    date: string;
    times: string[];
}

export class SessionAvailabilityResponse {
    hostId: string;
    productId: string;
    timezone: string;
    days: DayAvailability[];
}
