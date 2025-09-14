import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';

import { ResponseDto } from 'apps/libs/common/api/response.entity';
import { ProductResourceFileType } from 'apps/libs/common/enums/product-resource-file-type.enum';
import { ProductResourceType } from 'apps/libs/common/enums/product-resource-type.enum';
import { MultimediaSource } from 'apps/libs/common/enums/multimedia-source.enum';
import { MultimediaType } from 'apps/libs/common/enums/multimedia-type.enum';
import { ProductProgressStatus, TrackingMarker } from 'apps/libs/domain/products/product-progress.entity';
import { ResourceProcessingStatus } from 'apps/libs/common/enums/resource-processing-status.enum';

export class ProductResourceMetrics {
    @ApiProperty({
        description: 'Total duration of all resources in minutes',
        example: 120,
    })
    totalDuration: number;

    @ApiProperty({
        description: 'Total number of sections',
        example: 15,
    })
    totalSections: number;

    @ApiProperty({
        description: 'Total number of resources',
        example: 10,
    })
    totalResources: number;

    @ApiProperty({
        description: 'Total size of all resources in MB',
        example: 100,
    })
    totalSize: number;
}

export class ProductResourceResponse {
    @ApiProperty({
        description: 'Unique ID of the content',
        example: '12345678-abcd-efgh-ijkl-123456789012',
    })
    recordId: string;

    @ApiProperty({
        enum: ProductResourceType,
        description: 'Content type',
        example: ProductResourceType.SECTION,
    })
    type: ProductResourceType;

    @ApiProperty({
        description: 'Content title',
        example: 'Introduction to the course',
    })
    title: string;

    @ApiProperty({
        description: 'Content description',
        example: 'In this module you will learn the basic concepts',
        required: false,
    })
    description?: string;

    @ApiProperty({
        description:
            'Content long description. It will be displayed in the resource details page. It accepts markdown formatting.',
        example: 'In this module you will learn the basic concepts',
        required: false,
    })
    longDescription?: string;

    @ApiProperty({
        description: 'Display order of the content',
        example: 1,
    })
    order: number;

    @ApiProperty({
        description: 'Indicates if the resource is completed',
        example: true,
        required: false,
    })
    completed?: boolean;

    @ApiProperty({
        enum: ProductResourceFileType,
        description: 'File type (if applicable)',
        example: ProductResourceFileType.VIDEO,
        required: false,
    })
    fileType?: ProductResourceFileType;

    @ApiProperty({
        description: 'ID of the file resource in the storage provider. Only applicable when source is BUNNY_STREAM',
        example: '12345678-abcd-efgh-ijkl-123456789012',
        required: false,
    })
    fileId?: string;

    @ApiProperty({
        description: 'Status of the file resource. Only applicable when source is BUNNY_STREAM',
        example: ResourceProcessingStatus.TRANSCODING,
        required: false,
    })
    @IsEnum(ResourceProcessingStatus)
    processingStatus?: ResourceProcessingStatus;

    @ApiProperty({
        description: 'Encode progress of the file resource. Only applicable when source is BUNNY_STREAM',
        example: 50,
        required: false,
    })
    @IsNumber()
    @IsOptional()
    encodeProgress?: number;

    @ApiProperty({
        description: 'Name of the file resource',
        example: 'video.mp4',
        required: false,
    })
    fileName?: string;

    @ApiProperty({
        description: 'Content URL (if applicable)',
        example: 'https://example.com/video.mp4',
        required: false,
    })
    url?: string;

    @ApiProperty({
        description: 'Public URL of the file resource',
        example: 'https://example.com/video.mp4?token=1234567890&expires=1717000000',
        required: false,
    })
    publicUrl?: string;

    @ApiProperty({
        description: 'File size in MB',
        example: 15.5,
        required: false,
    })
    size?: number;

    @ApiProperty({
        description: 'Content duration in minutes',
        example: 45,
        required: false,
    })
    duration?: number;

    @ApiProperty({
        enum: MultimediaSource,
        description: 'Content multimedia source',
        example: MultimediaSource.APP,
        required: false,
    })
    source?: MultimediaSource;

    @ApiProperty({
        description: 'Indicates if this content is available as a preview',
        example: true,
        required: false,
    })
    preview?: boolean;

    @ApiProperty({
        description: 'Content thumbnail',
        type: 'object',
        example: {
            type: 'IMAGE',
            source: 'APP',
            path: 'public/hosts/12345678-abcd-efgh-ijkl-123456789012/products/thumbnails/thumbnail.jpg',
        },
        required: false,
    })
    thumbnail?: {
        type: string;
        source: string;
        path: string;
    };

    @ApiProperty({
        description: 'Child contents of this content',
        type: [ProductResourceResponse],
        required: false,
    })
    children?: ProductResourceResponse[];

    @ApiProperty({
        description: 'Indicates if this resource is downloadable',
        example: true,
        required: false,
    })
    downloadable?: boolean;
}

export class ProductResourcesWithMetricsResponse {
    @ApiProperty({
        description: 'Metrics of the contents',
        type: ProductResourceMetrics,
    })
    metrics: ProductResourceMetrics;

    @ApiProperty({
        description: 'List of contents',
        type: [ProductResourceResponse],
    })
    resources: ProductResourceResponse[];

    @ApiProperty({
        description: 'User progress in the product',
        required: false,
    })
    progress?: {
        total: number;
        status: ProductProgressStatus;
        trackingMarker?: TrackingMarker;
    };
}

export class GetProductResourcesResponse extends ResponseDto {
    @ApiProperty({
        description: 'Response status',
        example: 'success',
    })
    status: string;

    @ApiProperty({
        description: 'Descriptive message',
        example: 'ProductResourcesSuccessfullyRetrieved',
    })
    message: string;

    @ApiProperty({
        description: 'Data retrieved',
        type: ProductResourcesWithMetricsResponse,
        example: {
            metrics: {
                totalDuration: 120,
                totalSections: 2,
                totalResources: 10,
                totalSize: 100,
            },
            resources: [
                {
                    recordId: '12345678-abcd-efgh-ijkl-123456789012',
                    type: ProductResourceType.SECTION,
                    title: 'Module 1: Introduction',
                    description: 'Introduction to the main concepts',
                    order: 1,
                    completed: true,
                    thumbnail: {
                        type: MultimediaType.IMAGE,
                        source: MultimediaSource.APP,
                        path: 'https://cdn.guaybo.public/hosts/12345678-abcd-efgh-ijkl-123456789012/products/thumbnails/thumbnail.jpg',
                    },
                    children: [
                        {
                            recordId: '87654321-abcd-efgh-ijkl-123456789012',
                            type: ProductResourceType.SECTION,
                            title: 'Lesson 1: Basic concepts',
                            description: 'Learn the fundamental concepts',
                            order: 1,
                            completed: false,
                            children: [
                                {
                                    recordId: '11111111-abcd-efgh-ijkl-123456789012',
                                    type: ProductResourceType.RESOURCE,
                                    title: 'Video: Introduction',
                                    order: 1,
                                    completed: true,
                                    fileType: ProductResourceFileType.VIDEO,
                                    fileName: 'video1.mp4',
                                    url: 'https://example.com/video1.mp4',
                                    size: 15.5,
                                    duration: 10,
                                    source: MultimediaSource.APP,
                                    preview: true,
                                    downloadable: true,
                                },
                            ],
                        },
                    ],
                },
                {
                    recordId: '22222222-abcd-efgh-ijkl-123456789012',
                    type: ProductResourceType.SECTION,
                    title: 'Module 2: Advanced',
                    description: 'Advanced concepts of the course',
                    order: 2,
                    completed: false,
                    children: [],
                },
            ],
            progress: {
                status: 'IN_PROGRESS',
                progress: 50,
                trackingMarker: {
                    resourceId: '12345678-abcd-efgh-ijkl-123456789012',
                    seconds: 10,
                },
            },
        },
    })
    data: ProductResourcesWithMetricsResponse;

    constructor(status: string, statusCode: number, message: string, data: ProductResourcesWithMetricsResponse) {
        super(status, statusCode, message, data);
        this.status = status;
        this.message = message;
        this.data = data;
    }
}
