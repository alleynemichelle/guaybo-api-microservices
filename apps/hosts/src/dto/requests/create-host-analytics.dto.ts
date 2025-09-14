import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

enum AnalyticsProvider {
    META_PIXEL = 'META_PIXEL',
    GOOGLE_ANALYTICS = 'GOOGLE_ANALYTICS',
    TIKTOK_PIXEL = 'TIKTOK_PIXEL',
}

export class CreateHostAnalyticsDto {
    @ApiProperty({
        description: 'The analytics provider',
        enum: AnalyticsProvider,
        example: AnalyticsProvider.META_PIXEL,
    })
    @IsEnum(AnalyticsProvider)
    @IsNotEmpty()
    provider: AnalyticsProvider;

    @ApiProperty({
        description: 'The tracker ID from the provider (e.g., Pixel ID)',
        example: '123456789012345',
    })
    @IsString()
    @IsNotEmpty()
    trackerId: string;

    @ApiProperty({
        description: 'A custom name for the tracker',
        example: 'Main Pixel',
        required: false,
    })
    @IsString()
    @IsOptional()
    trackerName?: string;
}
