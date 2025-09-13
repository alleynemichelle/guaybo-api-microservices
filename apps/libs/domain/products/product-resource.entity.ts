import { v4 as uuidv4 } from 'uuid';
import { Type } from 'class-transformer';

import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Max,
    Min,
    ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { MultimediaSource } from 'apps/libs/common/enums/multimedia-source.enum';
import { ResourceProcessingStatus } from 'apps/libs/common/enums/resource-processing-status.enum';

import { MultimediaType } from 'apps/libs/common/enums/multimedia-type.enum';
import { DatabaseKeys } from 'apps/libs/common/enums/database-keys.enum';
import { getUTCDate } from 'apps/libs/common/utils/date';
import { Multimedia } from '../common/multimedia.entity';
import { Base } from '../common/base.entity';
import { Quiz } from './quiz.entity';
import { Survey } from './survey.entity';
import { QuestionResponseDto } from 'apps/libs/common/dto/question-response.dto';

/**
 * Enum for resource types
 */
export enum ProductResourceType {
    SECTION = 'SECTION',
    RESOURCE = 'RESOURCE',
    QUIZ = 'QUIZ',
    SURVEY = 'SURVEY',
}

/**
 * Enum for file types
 */
export enum ProductResourceFileType {
    VIDEO = 'VIDEO',
    DOCUMENT = 'DOCUMENT',
    IMAGE = 'IMAGE',
    AUDIO = 'AUDIO',
    TEXT = 'TEXT',
    URL = 'URL',
    MODULE = 'MODULE',
    LESSON = 'LESSON',
    OTHER = 'OTHER',
}

/**
 * Entity that represents a product resource
 */
export class ProductResource extends Base {
    @ApiProperty({
        description: 'ID of the product this resource belongs to',
        example: '12345678-abcd-efgh-ijkl-123456789012',
    })
    @IsString()
    @IsNotEmpty()
    productId: string;

    @ApiPropertyOptional({
        description: 'ID of the parent resource (for nested structure)',
        example: '12345678-abcd-efgh-ijkl-123456789012',
    })
    @IsString()
    @IsOptional()
    parentId?: string;

    @ApiProperty({
        enum: ProductResourceType,
        description: 'Type of the resource',
        example: ProductResourceType.SECTION,
    })
    @IsEnum(ProductResourceType)
    @IsNotEmpty()
    type: ProductResourceType;

    @ApiPropertyOptional({
        description: 'Configuration for the quiz (only applicable when type is QUIZ)',
        type: Quiz,
    })
    @ValidateNested()
    @Type(() => Quiz)
    @IsOptional()
    quiz?: Quiz;

    @ApiPropertyOptional({
        description: 'Configuration for the survey (only applicable when type is SURVEY)',
        type: Survey,
    })
    @ValidateNested()
    @Type(() => Survey)
    @IsOptional()
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
        type: Multimedia,
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
        description: 'ID of the thumbnail',
        example: 1,
    })
    @IsNumber()
    @IsOptional()
    thumbnailId?: number;

    @ApiPropertyOptional({
        description: 'ID of the multimedia',
        example: 1,
    })
    @IsNumber()
    @IsOptional()
    multimediaId?: number;

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
    @IsOptional()
    @IsEnum(MultimediaSource, { each: true })
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
        description: 'Public URL of the file resource',
        example: 'https://example.com/video.mp4?token=1234567890&expires=1717000000',
    })
    @IsString()
    @IsOptional()
    publicUrl?: string;

    @ApiPropertyOptional({
        description: 'ID of the file resource in the storage provider. Only applicable when source is BUNNY_STREAM',
        example: '12345678-abcd-efgh-ijkl-123456789012',
    })
    @IsString()
    @IsOptional()
    fileId?: string;

    @ApiPropertyOptional({
        description: 'Status of the file resource. Only applicable when source is BUNNY_STREAM',
        example: ResourceProcessingStatus.TRANSCODING,
    })
    @IsEnum(ResourceProcessingStatus)
    @IsOptional()
    processingStatus?: ResourceProcessingStatus;

    @ApiPropertyOptional({
        description: 'Encode progress of the file resource. Only applicable when source is BUNNY_STREAM',
        example: 50,
    })
    @IsNumber()
    @Min(0)
    @Max(100)
    @IsOptional()
    encodeProgress?: number;

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

    @ApiProperty({
        description: 'Order of the resource in the list',
        example: 1,
    })
    @IsNumber()
    @Min(1)
    @IsNotEmpty()
    order: number;

    @ApiPropertyOptional({
        description: 'Child resources (used for hierarchical structure)',
        type: [ProductResource],
    })
    @IsOptional()
    children?: ProductResource[];

    @ApiPropertyOptional({
        description: 'Indicates if this resource is downloadable',
        example: true,
    })
    @IsBoolean()
    @IsOptional()
    downloadable?: boolean;

    @ApiPropertyOptional({
        description: 'ID of the plans this resource is associated with',
        example: ['12345678-abcd-efgh-ijkl-123456789012'],
        type: [String],
    })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    planIds?: string[];

    @ApiPropertyOptional({
        description: 'Questions for this resource (if it is a quiz or survey)',
        type: [QuestionResponseDto],
    })
    @IsOptional()
    questions?: QuestionResponseDto[];

    @ApiPropertyOptional({
        description: 'Number of views for this resource',
        example: 150,
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    totalViews?: number;

    constructor(productResource: ProductResource) {
        super();
        Object.assign(this, productResource);

        this.recordId = productResource.recordId || uuidv4();
        this.recordType = DatabaseKeys.PRODUCT_RESOURCE;
        this.createdAt = productResource.createdAt || getUTCDate().toISOString();
        this.updatedAt = productResource.updatedAt || getUTCDate().toISOString();

        // Remove query parameters and get the path after the domain
        if (this.url && this.source === MultimediaSource.APP) {
            const urlWithoutParams = this.url.split('?')[0];
            const pathParts = urlWithoutParams.split('/');
            const privateIndex = pathParts.findIndex((part) => part === 'private');

            if (privateIndex !== -1) {
                this.url = pathParts.slice(privateIndex).join('/');
            }
        }

        if (this.thumbnail) {
            this.thumbnail =
                this.thumbnail.source === MultimediaSource.APP
                    ? {
                          ...this.thumbnail,
                          path: this.thumbnail.path
                              ? (() => {
                                    const pathWithoutParams = this.thumbnail.path.split('?')[0];
                                    const pathParts = pathWithoutParams.split('/');
                                    const publicIndex = pathParts.findIndex((part) => part === 'public');
                                    return publicIndex !== -1
                                        ? pathParts.slice(publicIndex).join('/')
                                        : this.thumbnail.path;
                                })()
                              : undefined,
                      }
                    : this.thumbnail;
        }
    }
}
