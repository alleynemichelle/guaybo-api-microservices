import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Status } from 'apps/libs/common/enums/status.enum';

export class UpdateHostAnalyticsDto {
    @ApiProperty({
        description: 'The new tracker ID from the provider',
        example: '987654321098765',
        required: false,
    })
    @IsString()
    @IsOptional()
    trackerId?: string;

    @ApiProperty({
        description: 'The new custom name for the tracker',
        example: 'Secondary Pixel',
        required: false,
    })
    @IsString()
    @IsOptional()
    trackerName?: string;

    @ApiProperty({
        description: 'The new status for the tracker',
        enum: [Status.ACTIVE, Status.INACTIVE],
        example: Status.INACTIVE,
        required: false,
    })
    @IsEnum([Status.ACTIVE, Status.INACTIVE])
    @IsOptional()
    status?: Status;
}
