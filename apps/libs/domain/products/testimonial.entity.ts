import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';
import { Multimedia } from '../common/multimedia.entity';

export class Testimonial {
    @ApiPropertyOptional({
        description: 'The comment or review provided by the user',
        example: 'The service was excellent! Highly recommended.',
        required: false,
    })
    @IsString()
    comment?: string;

    @ApiPropertyOptional({
        description: 'The date and time when the testimonial was created (ISO 8601 format with timezone)',
        example: '2025-01-01T00:00:00Z',
        required: false,
    })
    @IsOptional()
    @IsDateString()
    date?: string;

    @ApiPropertyOptional({
        description: 'An array of image URLs associated with the testimonial',
        // example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
        required: false,
        type: [Multimedia],
    })
    @IsArray()
    @Type(() => Multimedia)
    images?: Multimedia[];

    @ApiPropertyOptional({
        description: 'The rating provided by the user (e.g., 1 to 5 stars)',
        example: 4.5,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    rating?: number;

    @ApiPropertyOptional({
        description: 'The name of the user who provided the testimonial',
        example: 'John Doe',
        required: false,
    })
    @IsString()
    userName?: string;
}
