import { ApiProperty } from '@nestjs/swagger';
import { ResponseDto } from 'apps/libs/common/api/response.entity';

export class HostAnalyticsDto {
    @ApiProperty({
        description: 'The unique record ID of the analytics entry',
        example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    })
    recordId: string;

    @ApiProperty({
        description: 'The analytics provider',
        example: 'META',
    })
    provider: string;

    @ApiProperty({
        description: 'The tracker ID from the provider',
        example: '123456789012345',
    })
    trackerId: string;

    @ApiProperty({
        description: 'A custom name for the tracker',
        example: 'Main Pixel',
        required: false,
    })
    trackerName?: string;

    @ApiProperty({
        description: 'The status of the tracker',
        example: 'ACTIVE',
    })
    status: string;

    @ApiProperty({
        description: 'Timestamp of creation',
        example: '2024-09-06T01:28:42.181Z',
    })
    createdAt: string;
}

export class CreateHostAnalyticsResponseDto extends ResponseDto {
    @ApiProperty({
        type: HostAnalyticsDto,
        example: {
            recordId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
            provider: 'META',
            trackerId: '123456789012345',
            trackerName: 'Main Pixel',
            status: 'ACTIVE',
            createdAt: '2024-09-06T01:28:42.181Z',
        },
    })
    data: HostAnalyticsDto;
}
