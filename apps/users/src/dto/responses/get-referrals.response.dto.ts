import { ApiProperty } from '@nestjs/swagger';
import { ResponseDto } from 'apps/libs/common/api/response.entity';

export class ReferralsUserDto {
    @ApiProperty({
        example: 'e3fce3b2-bc59-4d61-8beb-17fe3829d571',
        nullable: true,
    })
    recordId: string | null;

    @ApiProperty({ example: 'john.doe@example.com' })
    email: string;

    @ApiProperty({ example: '2024-09-06T01:28:42.181Z' })
    createdAt: string;

    @ApiProperty({ example: 'REF-123', nullable: true })
    referralCode: string | null;

    @ApiProperty({ example: 'google', nullable: true })
    utmSource: string | null;
}

export class ReferralsMetricsDto {
    @ApiProperty({ example: 100 })
    totalUsers: number;

    @ApiProperty({ example: 25 })
    usersWithHost: number;

    @ApiProperty({ example: { google: 50, facebook: 30, organic: 20 } })
    sources: Record<string, number>;
}

export class GetReferralsResponseDataDto {
    @ApiProperty({ type: ReferralsMetricsDto })
    metrics: ReferralsMetricsDto;

    @ApiProperty({ type: [ReferralsUserDto] })
    users: ReferralsUserDto[];
}

export class GetReferralsResponseDto extends ResponseDto {
    @ApiProperty({
        type: GetReferralsResponseDataDto,
        example: {
            metrics: {
                totalUsers: 100,
                usersWithHost: 25,
                sources: {
                    google: 50,
                    facebook: 30,
                    organic: 20,
                },
            },
            users: [
                {
                    recordId: 'e3fce3b2-bc59-4d61-8beb-17fe3829d571',
                    email: 'john.doe@example.com',
                    createdAt: '2024-09-06T01:28:42.181Z',
                    referralCode: 'REF-123',
                    utmSource: 'google',
                },
                {
                    recordId: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
                    email: 'jane.doe@example.com',
                    createdAt: '2024-09-07T01:28:42.181Z',
                    referralCode: null,
                    utmSource: 'facebook',
                },
            ],
        },
    })
    data: GetReferralsResponseDataDto;
}
