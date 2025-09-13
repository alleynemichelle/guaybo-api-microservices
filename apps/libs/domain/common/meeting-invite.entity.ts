import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MeetingPlatform } from 'apps/libs/common/enums/meeting-platform.enum';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class MeetingInvitation {
    @ApiProperty({
        enum: MeetingPlatform,
        description: 'Platform used for the meeting',
        example: MeetingPlatform.ZOOM,
        required: true,
    })
    @IsNotEmpty()
    @IsEnum(MeetingPlatform)
    platform: MeetingPlatform;

    @ApiPropertyOptional({
        description: 'URL of the meeting',
        example: 'https://zoom.us/j/123456789',
        required: false,
    })
    @IsOptional()
    @IsUrl()
    url?: string;

    @ApiProperty({
        description: 'Additional instructions for joining the meeting',
        example: 'Please join 5 minutes before the scheduled time',
        required: false,
    })
    @IsOptional()
    @IsString()
    instructions?: string;
}
