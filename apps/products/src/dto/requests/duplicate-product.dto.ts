import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ProductDate } from 'apps/libs/entities/products/product.entity';
import { ProductDateStatus } from 'apps/libs/common/enums/product-date-status.enum';

export class DuplicateProductDto {
    @ApiProperty({
        description: 'Name for the duplicated product',
        example: 'Copy of my event',
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        description: 'Alias for the duplicated product',
        example: 'copy-my-event',
    })
    @IsString()
    @IsNotEmpty()
    alias: string;

    @ApiPropertyOptional({
        type: [ProductDate],
        description: 'Available dates for the product',
        example: [
            {
                status: ProductDateStatus.DEPENDS_ON_DATE,
                initialDate: {
                    date: '2025-02-12',
                    time: '10:00',
                    timezone: 'America/Caracas',
                },
                endDate: {
                    date: '2025-02-15',
                    time: '14:00',
                    timezone: 'America/Caracas',
                },
            },
        ],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductDate)
    @IsOptional()
    @ArrayMinSize(1)
    dates?: ProductDate[];
}
