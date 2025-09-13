import { ProductType } from 'apps/libs/common/enums/product-type.enum';
import { BaseProduct } from './product.entity';
import { SessionProduct } from './session.entity';
import { DigitalProduct } from './digital-product.entity';
import { EventProduct } from './event.entity';
import { DigitalCourse } from './digital-course.entity';

/**
 * Factory function to create a specific product instance based on type
 * @param data Partial product data
 * @returns Appropriate product instance based on type
 */
export function setProduct(data: Partial<BaseProduct>): BaseProduct {
    switch (data.productType) {
        case ProductType.EVENT:
            return new EventProduct(data);
        case ProductType.ONE_TO_ONE_SESSION:
            return new SessionProduct(data);
        case ProductType.DIGITAL_PRODUCT:
            return new DigitalProduct(data);
        case ProductType.DIGITAL_COURSE:
            return new DigitalCourse(data);
        default:
            throw new Error(`Invalid product type: ${data.productType}`);
    }
}
