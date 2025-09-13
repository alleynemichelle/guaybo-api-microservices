import { BaseProduct } from './product.entity';

import { ProductType } from 'apps/libs/common/enums/product-type.enum';

export class DigitalProduct extends BaseProduct {
    constructor(product: Partial<DigitalProduct>) {
        super(product);
        this.productType = ProductType.DIGITAL_PRODUCT;
    }
}
