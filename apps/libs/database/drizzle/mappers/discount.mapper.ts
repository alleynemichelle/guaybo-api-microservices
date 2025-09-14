import { Discount } from 'apps/libs/domain/bookings/discount.entity';
import { Status } from 'apps/libs/common/enums/status.enum';
import { DatabaseKeys } from 'apps/libs/common/enums/database-keys.enum';
import { DiscountWithStatus, NewDiscount } from '../types';
import { AmountType } from 'apps/libs/common/enums/amount-type.enum';
import { DiscountScope } from 'apps/libs/common/enums/discount-scope.enum';
import { Unit } from 'apps/libs/common/enums/unit.enum';
import { ValueItem } from 'apps/libs/domain/common/value-item.entity';

export class DiscountMapper {
    static toDomain(row: DiscountWithStatus): Discount {
        // Map duration if both quantity and unit exist
        let duration: ValueItem | undefined;
        if (row.durationQuantity && row.durationUnit) {
            duration = new ValueItem();
            ((duration.quantity = row.durationQuantity), (duration.unit = row.durationUnit as Unit));
        }

        const discount = new Discount();
        discount.id = row.id;
        discount.recordId = row.recordId;
        discount.name = row.name;
        discount.description = row.description ?? undefined;
        discount.amount = row.amount;
        discount.type = row.type as AmountType;
        discount.scope = row.scope as DiscountScope;
        discount.validFrom = row.validFrom?.toISOString();
        discount.validUntil = row.validUntil?.toISOString();
        discount.code = row.code ?? undefined;
        discount.maxCapacity = row.maxCapacity ?? undefined;
        discount.duration = duration;
        //  discount.totalBookings = row.totalBookings ?? undefined;
        discount.conditions = row.conditions as any;
        discount.discountStatus = (row.status?.name as any) ?? undefined;
        discount.recordStatus = (row.status?.name as Status) ?? Status.ACTIVE;
        discount.recordType = DatabaseKeys.DISCOUNT;
        discount.createdAt = row.createdAt?.toISOString();
        discount.updatedAt = row.updatedAt?.toISOString();

        return discount;
    }

    static toPersistence(entity: Discount, statusId: number): NewDiscount {
        return {
            recordId: entity.recordId,
            ownerType: 'HOST', // Default value, could be parameterized
            name: entity.name,
            description: entity.description,
            amount: entity.amount,
            type: entity.type,
            scope: entity.scope,
            statusId: statusId,
            validFrom: entity.validFrom ? new Date(entity.validFrom) : undefined,
            validUntil: entity.validUntil ? new Date(entity.validUntil) : undefined,
            code: entity.code,
            maxCapacity: entity.maxCapacity,
            durationQuantity: entity.duration?.quantity ? entity.duration.quantity : undefined,
            durationUnit: entity.duration?.unit,
            conditions: entity.conditions,
        };
    }
}
