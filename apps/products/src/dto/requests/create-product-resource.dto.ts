import {
    IsBoolean,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Min,
    ValidateIf,
    ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { ProductResourceType, ProductResourceFileType } from 'apps/libs/entities/products/product-resource.entity';
import { MultimediaSource } from 'apps/libs/common/enums/multimedia-source.enum';
import { Multimedia } from 'apps/libs/entities/common/multimedia.entity';
import { MultimediaType } from 'apps/libs/common/enums/multimedia-type.enum';
import { Quiz } from 'apps/libs/entities/products/quiz.entity';
import { Survey } from 'apps/libs/entities/products/survey.entity';
import { Type } from 'class-transformer';

export class CreateProductResourceDto {
    @ApiProperty({
        description: 'Type of the resource',
        example: ProductResourceType.SECTION,
        enum: ProductResourceType,
    })
    @IsEnum(ProductResourceType)
    @IsNotEmpty()
    type: ProductResourceType;

    @ApiPropertyOptional({
        description: 'Configuration for the quiz (only applicable when type is QUIZ)',
        type: Quiz,
    })
    @ValidateIf((o) => o.type === ProductResourceType.QUIZ)
    @ValidateNested()
    @Type(() => Quiz)
    @IsNotEmpty()
    quiz?: Quiz;

    @ApiPropertyOptional({
        description: 'Configuration for the survey (only applicable when type is SURVEY)',
        type: Survey,
    })
    @ValidateIf((o) => o.type === ProductResourceType.SURVEY)
    @ValidateNested()
    @Type(() => Survey)
    @IsNotEmpty()
    survey?: Survey;

    @ApiProperty({
        description: 'Title of the resource',
        example: 'Introduction to the course',
    })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiPropertyOptional({
        description: 'Thumbnail of the resource',
        example: {
            type: MultimediaType.IMAGE,
            source: MultimediaSource.APP,
            path: 'public/hosts/12345678-abcd-efgh-ijkl-123456789012/products/thumbnails/thumbnail.jpg',
        },
    })
    @ValidateNested()
    @IsOptional()
    thumbnail?: Multimedia;

    @ApiPropertyOptional({
        description: 'ID of the parent resource (for nested structure)',
        example: '12345678-abcd-efgh-ijkl-123456789012',
    })
    @IsString()
    @IsOptional()
    parentId?: string;

    @ApiPropertyOptional({
        description: 'Description of the resource',
        example: 'Learn the basics of the course in this introductory lesson',
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({
        description:
            'Long description of the resource. It will be displayed in the resource details page. It accepts markdown formatting.',
        example:
            'Learn the basics of the course in this introductory lesson. This is a long description that will be displayed in the resource details page.',
    })
    @IsString()
    @IsOptional()
    longDescription?: string;

    @ApiPropertyOptional({
        enum: ProductResourceFileType,
        description: 'Type of the file (only applicable when type is RESOURCE)',
        example: ProductResourceFileType.VIDEO,
    })
    @IsEnum(ProductResourceFileType)
    @IsOptional()
    fileType?: ProductResourceFileType;

    @ApiPropertyOptional({
        description: 'Source of the multimedia. ',
        example: MultimediaSource.APP,
        default: MultimediaSource.APP,
        enum: MultimediaSource,
    })
    @ValidateIf((o) => !!o.url)
    @IsNotEmpty()
    @IsEnum(MultimediaSource)
    source?: MultimediaSource;

    @ApiPropertyOptional({
        description: 'Name of the file resource',
        example: 'video.mp4',
    })
    @IsString()
    @IsOptional()
    fileName?: string;

    @ApiPropertyOptional({
        description: 'URL of the file resource',
        example: 'https://example.com/video.mp4',
    })
    @IsString()
    @IsOptional()
    url?: string;

    @ApiPropertyOptional({
        description: 'ID of the file resource in the storage provider. Only applicable when source is BUNNY_STREAM',
        example: '12345678-abcd-efgh-ijkl-123456789012',
    })
    @ValidateIf((o) => o.source === MultimediaSource.BUNNY_STREAM)
    @IsNotEmpty()
    @IsString()
    fileId?: string;

    @ApiPropertyOptional({
        description: 'Size of the file in MB',
        example: 15.5,
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    size?: number;

    @ApiPropertyOptional({
        description: 'Duration of the resource in minutes',
        example: 45,
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    duration?: number;

    @ApiPropertyOptional({
        description: 'Indicates if this resource is available as preview (it means is public)',
        example: true,
    })
    @IsBoolean()
    @IsOptional()
    preview?: boolean;

    @ApiProperty({
        description: 'Order of the resource in the list',
        example: 1,
    })
    @IsNumber()
    @Min(1)
    @IsNotEmpty()
    order: number;

    @ApiPropertyOptional({
        description: 'Indicates if this resource is downloadable',
        example: true,
    })
    @IsBoolean()
    @IsOptional()
    downloadable?: boolean;
}
