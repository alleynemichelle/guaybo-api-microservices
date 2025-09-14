import { ApiProperty } from '@nestjs/swagger';
import { ResponseDto } from 'apps/libs/common/api/response.entity';
import { HostAnalyticsDto } from './create-host-analytics-response.dto';

export class GetHostAnalyticsResponseDataDto {
    @ApiProperty({ type: [HostAnalyticsDto] })
    analytics: HostAnalyticsDto[];
}

export class GetHostAnalyticsResponseDto extends ResponseDto {
    @ApiProperty({
        type: [HostAnalyticsDto],
        example: [
            {
                recordId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
                provider: 'META',
                trackerId: '123456789012345',
                trackerName: 'Main Pixel',
                status: 'ACTIVE',
                createdAt: '2024-09-06T01:28:42.181Z',
            },
            {
                recordId: 'b2c3d4e5-f6a7-8901-2345-67890abcdef1',
                provider: 'GOOGLE',
                trackerId: 'UA-12345678-9',
                trackerName: 'Google Analytics',
                status: 'ACTIVE',
                createdAt: '2024-09-07T02:30:00.000Z',
            },
        ],
    })
    data: HostAnalyticsDto[];
}
