import { ProductType } from 'apps/libs/common/enums/product-type.enum';
import { generateId } from 'apps/libs/common/utils/generate-id';
import { convertToUTC } from 'apps/libs/common/utils/date';
import { ProductDateStatus } from 'apps/libs/common/enums/product-date-status.enum';

import { ProductDate } from './product.entity';
import { BaseProduct } from './product.entity';

export class EventProduct extends BaseProduct {
    constructor(product: Partial<EventProduct>) {
        super(product);

        this.productType = ProductType.EVENT;
        this.dates =
            product.dates
                ?.map((date) => ({
                    ...date,
                    status: date.status ?? ProductDateStatus.DEPENDS_ON_DATE,
                    recordId: date.recordId ?? generateId(),
                }))
                .sort(this.sortDates) || [];

        this.mainDate = this.getMainDate(this.dates);
    }

    private getMainDate(dates: ProductDate[]): string | undefined {
        if (dates && dates.length > 0) {
            let minInitial = dates[0].initialDate;
            let minDateTime = convertToUTC(minInitial).utcDate;

            dates.forEach((item) => {
                const currentDateTime = convertToUTC(item.initialDate).utcDate;

                if (currentDateTime < minDateTime) {
                    minDateTime = currentDateTime;
                    minInitial = item.initialDate;
                }
            });

            return minInitial.date;
        }
        return undefined;
    }
}
