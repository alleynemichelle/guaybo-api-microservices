import { ProductDateStatus } from 'apps/libs/common/enums/product-date-status.enum';
import { convertToUTC } from 'apps/libs/common/utils/date';
import { generateId } from 'apps/libs/common/utils/generate-id';
import { ProductDate } from 'apps/libs/entities/products/product.entity';

export function processProductDates(dates: ProductDate[]): ProductDate[] {
    return dates.map((date) => ({
        ...date,
        initialDate: convertToUTC(date.initialDate).result,
        endDate: date.endDate
            ? {
                  ...convertToUTC({
                      ...date.endDate,
                      time: date.endDate.time || '23:59',
                      timezone: date.endDate.timezone,
                  }).result,
              }
            : undefined,
        status: date.status ?? ProductDateStatus.DEPENDS_ON_DATE,
        recordId: date.recordId ?? generateId(),
    }));
}
