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
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

import { ProductResourceType } from 'apps/libs/common/enums/product-resource-type.enum';
import { ProductResourceFileType } from 'apps/libs/common/enums/product-resource-file-type.enum';
import { MultimediaSource } from 'apps/libs/common/enums/multimedia-source.enum';
import { Multimedia } from 'apps/libs/domain/common/multimedia.entity';
import { MultimediaType } from 'apps/libs/common/enums/multimedia-type.enum';

export class UpdateProductResourceDto {
    @ApiPropertyOptional({
        description: 'Type of the resource',
        example: ProductResourceType.SECTION,
        enum: ProductResourceType,
    })
    @IsEnum(ProductResourceType)
    @IsOptional()
    type?: ProductResourceType;

    @ApiPropertyOptional({
        description: 'Thumbnail of the resource',
        example: {
            type: MultimediaType.IMAGE,
            source: MultimediaSource.APP,
            path: 'public/hosts/12345678-abcd-efgh-ijkl-123456789012/products/thumbnails/thumbnail.jpg',
        },
    })
    @ValidateNested()
    @Type(() => Multimedia)
    @IsOptional()
    thumbnail?: Multimedia;

    @ApiPropertyOptional({
        description: 'Title of the resource',
        example: 'Introduction to the course',
    })
    @IsString()
    @IsOptional()
    title?: string;

    @ApiPropertyOptional({
        description: 'ID of the parent resource (for nested structure). Set to null or empty string to remove parent.',
        example: '12345678-abcd-efgh-ijkl-123456789012',
    })
    @IsString()
    @IsOptional()
    parentId?: string | null;

    @ApiPropertyOptional({
        description: 'Description of the resource',
        example: 'Learn the basics of the course in this introductory lesson',
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({
        enum: ProductResourceFileType,
        description: 'Type of the file (only applicable when type is RESOURCE)',
        example: ProductResourceFileType.VIDEO,
    })
    @IsEnum(ProductResourceFileType)
    @IsOptional()
    fileType?: ProductResourceFileType;

    @ApiPropertyOptional({
        description: 'Source of the multimedia',
        example: MultimediaSource.APP,
        enum: MultimediaSource,
    })
    @ValidateIf((o) => !!o.url)
    @IsNotEmpty()
    @IsEnum(MultimediaSource)
    source?: MultimediaSource;

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
    @IsString()
    @IsOptional()
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
        description: 'Indicates if this resource is available as preview',
        example: true,
    })
    @IsBoolean()
    @IsOptional()
    preview?: boolean;

    @ApiPropertyOptional({
        description: 'Order of the resource in the list',
        example: 1,
    })
    @IsNumber()
    @Min(1)
    @IsOptional()
    order?: number;

    @ApiPropertyOptional({
        description: 'Indicates if this resource is downloadable',
        example: true,
    })
    @IsBoolean()
    @IsOptional()
    downloadable?: boolean;
}
