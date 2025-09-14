import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

import { ProductStatus } from 'apps/libs/common/enums/product-status.enum';

export class UpdateProductStatusDto {
    @ApiProperty({
        enum: ProductStatus,
        description: 'Status of the product.',
        example: ProductStatus.PUBLISHED,
        default: ProductStatus.DRAFT,
    })
    @IsNotEmpty()
    @IsEnum(ProductStatus)
    productStatus: ProductStatus;
}
