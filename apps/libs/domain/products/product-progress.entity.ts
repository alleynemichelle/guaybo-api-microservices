import { v4 as uuidv4 } from 'uuid';

import { IsArray, IsBoolean, IsDate, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

import { Base } from '../common/base.entity';
import { getUTCDate } from 'apps/libs/common/utils/date';
import { DatabaseKeys } from 'apps/libs/common/enums/database-keys.enum';

export enum ProductProgressStatus {
    COMPLETED = 'COMPLETED',
    IN_PROGRESS = 'IN_PROGRESS',
    NOT_STARTED = 'NOT_STARTED',
}

export class TrackingMarker {
    @ApiProperty({
        description: 'ID of the resource this progress belongs to',
        example: '12345678-abcd-efgh-ijkl-123456789012',
    })
    @IsString()
    @IsNotEmpty()
    resourceId: string;

    @ApiProperty({
        description: 'Seconds spent on the last resource',
        example: 10,
    })
    @IsNumber()
    @IsOptional()
    seconds?: number;
}

export class ProductProgressResource {
    @ApiProperty({
        description: 'ID of the resource this progress belongs to',
        example: '12345678-abcd-efgh-ijkl-123456789012',
    })
    @IsString()
    @IsNotEmpty()
    resourceId: string;

    @ApiProperty({
        description: 'Completed',
        example: true,
    })
    @IsBoolean()
    @IsNotEmpty()
    completed: boolean;

    @ApiPropertyOptional({
        description: 'Completed at',
        example: '2021-01-01',
    })
    @IsDate()
    @IsOptional()
    completedAt?: string;
}

export class ProductProgress extends Base {
    @ApiProperty({
        description: 'ID of the host this progress belongs to',
        example: '12345678-abcd-efgh-ijkl-123456789012',
    })
    @IsString()
    @IsNotEmpty()
    hostId: string;

    @ApiProperty({
        description: 'ID of the product this resource belongs to',
        example: '12345678-abcd-efgh-ijkl-123456789012',
    })
    @IsString()
    @IsNotEmpty()
    productId: string;

    @ApiProperty({
        description: 'ID of the user this progress belongs to',
        example: '12345678-abcd-efgh-ijkl-123456789012',
    })
    @IsString()
    @IsNotEmpty()
    userId: string;

    @ApiProperty({
        description: 'Status of the progress',
        example: 'COMPLETED',
        enum: ProductProgressStatus,
    })
    @IsEnum(ProductProgressStatus)
    @IsNotEmpty()
    progressStatus: ProductProgressStatus;

    @ApiProperty({
        description: 'Progress of the product',
        example: 10,
    })
    @IsNumber()
    @IsNotEmpty()
    progress: number;

    @ApiPropertyOptional({
        description: 'Last resource',
        example: {
            resourceId: '12345678-abcd-efgh-ijkl-123456789012',
            seconds: 10,
        },
    })
    @ValidateNested()
    @Type(() => TrackingMarker)
    @IsOptional()
    trackingMarker?: TrackingMarker;

    @ApiPropertyOptional({
        description: 'Seconds spent on the last resource',
        example: 10,
    })
    @IsNumber()
    @IsOptional()
    seconds?: number;

    @ApiPropertyOptional({
        description: 'Completed at',
        example: '2021-01-01',
    })
    @IsDate()
    @IsOptional()
    completedAt?: Date;

    @ApiPropertyOptional({
        description: 'Details of the progress',
        example: [
            {
                resourceId: '12345678-abcd-efgh-ijkl-123456789012',
                completed: true,
                completedAt: '2021-01-01',
            },
        ],
    })
    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => ProductProgressResource)
    completedResources?: ProductProgressResource[];

    constructor(data: Partial<ProductProgress>) {
        super();
        Object.assign(this, data);

        this.recordId = data.recordId ?? uuidv4();
        this.createdAt = data.createdAt ?? getUTCDate().toISOString();
        this.updatedAt = data.updatedAt ?? getUTCDate().toISOString();
        this.recordType = DatabaseKeys.PROGRESS;
    }
}
