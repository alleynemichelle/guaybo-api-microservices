import { ApiProperty } from '@nestjs/swagger';
import { Product } from 'apps/libs/domain/products.types';

export class CreateProductResponseDto {
    @ApiProperty()
    recordId: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    alias: string;

    constructor(product: Product) {
        this.recordId = product.recordId;
        this.name = product.name;
        this.alias = product.alias;
    }
}
