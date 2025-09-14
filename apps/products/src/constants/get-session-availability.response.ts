import { ApiProperty } from '@nestjs/swagger';
import { ResponseDto } from 'apps/libs/api/response.entity';
import { DayAvailability } from '../dto/requests/get-session-availability.dto';

class SessionAvailabilityResponseClass {
    @ApiProperty({
        description: 'Host ID',
        example: '2230439a-d3ea-408b-b05a-5e2e5316325a',
    })
    hostId: string;

    @ApiProperty({
        description: 'Product ID',
        example: '33d7b109-1d42-ac42-c27f-8d7ff89d5711',
    })
    productId: string;

    @ApiProperty({
        description: 'Timezone used for availability',
        example: 'America/Caracas',
    })
    timezone: string;

    @ApiProperty({
        description: 'List of days with their availability slots',
        type: [DayAvailability],
    })
    days: DayAvailability[];
}

export class GetSessionAvailabilityResponse extends ResponseDto {
    @ApiProperty({
        type: SessionAvailabilityResponseClass,
        example: {
            hostId: '2230439a-d3ea-408b-b05a-5e2e5316325a',
            productId: '33d7b109-1d42-ac42-c27f-8d7ff89d5711',
            timezone: 'America/Caracas',
            days: [
                {
                    date: '2025-01-01',
                    times: ['10:00', '10:30', '11:00'],
                },
            ],
        },
    })
    data: SessionAvailabilityResponseClass;
}
