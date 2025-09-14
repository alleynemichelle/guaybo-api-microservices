import { ApiProperty } from '@nestjs/swagger';
import { ResponseDto } from 'apps/libs/common/api/response.entity';

export class ReferrerCodeDataDto {
    @ApiProperty({ example: 90, nullable: true })
    durationDays: number | null;

    @ApiProperty({ example: 'REF-XYZ-123' })
    code: string;

    @ApiProperty({ example: 'ACTIVE', nullable: true })
    recordStatus: string | null;

    @ApiProperty({ example: '2024-09-08T10:00:00.000Z' })
    createdAt: string;

    @ApiProperty({ example: 30, nullable: true })
    windowDays: number | null;

    @ApiProperty({ example: 'b2c1d0e9-f8g7-h6i5-j4k3-l2m1n0o9p8q7' })
    recordId: string;

    @ApiProperty({ example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6' })
    referrerId: string;
}

export class GetReferrerCodesResponseDto extends ResponseDto {
    @ApiProperty({
        type: [ReferrerCodeDataDto],
        example: [
            {
                durationDays: 90,
                code: 'REF-XYZ-123',
                recordStatus: 'ACTIVE',
                createdAt: '2024-09-08T10:00:00.000Z',
                windowDays: 30,
                recordId: 'b2c1d0e9-f8g7-h6i5-j4k3-l2m1n0o9p8q7',
                referrerId: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
            },
        ],
    })
    data: ReferrerCodeDataDto[];
}
