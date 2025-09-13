import { PaymentOption } from 'apps/libs/domain/bookings/payment-option.entity';
import { Status } from 'apps/libs/common/enums/status.enum';
import { PaymentMethod } from 'apps/libs/common/enums/payment-method.enum';
import { Currency } from 'apps/libs/common/enums/currency.enum';
import { DatabaseKeys } from 'apps/libs/common/enums/database-keys.enum';
import { PaymentOptionWithMethod } from '../types';

export class PaymentOptionMapper {
    static toDomain(row: PaymentOptionWithMethod): PaymentOption {
        return new PaymentOption({
            id: row.id,
            recordId: row.recordId,
            createdAt: row.createdAt?.toISOString(),
            updatedAt: row.updatedAt?.toISOString(),
            recordStatus: (row.status?.name as Status) ?? Status.ACTIVE,
            recordType: DatabaseKeys.PAYMENT_OPTIONS,
            paymentMethod: row.paymentMethod.key as PaymentMethod,
            currency: row.paymentMethod.currency.code as Currency,
            requiresCoordination: row.paymentMethod.requiresCoordination ?? false,
            icon: row.paymentMethod.icon ?? undefined,
            customAttributes: (row.customAttributes as Record<string, any>) ?? undefined,
        });
    }

    static toPersistence(entity: PaymentOption, paymentMethodId: number, statusId: number) {
        return {
            recordId: entity.recordId,
            paymentMethodId: paymentMethodId,
            customAttributes: entity.customAttributes ?? {},
            statusId: entity.recordStatus ? statusId : null,
        };
    }
}
