import { BaseProduct } from './product.entity';

import { ProductType } from 'apps/libs/common/enums/product-type.enum';

export class DigitalCourse extends BaseProduct {
    constructor(product: Partial<DigitalCourse>) {
        super(product);
        this.productType = ProductType.DIGITAL_COURSE;
    }
}
