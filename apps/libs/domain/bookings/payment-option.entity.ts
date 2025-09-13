import { v4 as uuidv4 } from 'uuid';

import { IsEnum, IsBoolean, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { PaymentMethod } from 'apps/libs/common/enums/payment-method.enum';
import { getUTCDate } from 'apps/libs/common/utils/date';
import { DatabaseKeys } from 'apps/libs/common/enums/database-keys.enum';
import { paymentOptionSettings } from 'apps/libs/common/constants/payment-methods.constant';
import { Status } from 'apps/libs/common/enums/status.enum';
import { Currency } from 'apps/libs/common/enums/currency.enum';

import { Base } from '../common/base.entity';

export class PaymentOption extends Base {
    @IsEnum(PaymentMethod)
    @IsNotEmpty()
    paymentMethod: PaymentMethod;

    @IsNotEmpty()
    @IsEnum(Currency)
    currency: Currency;

    @IsBoolean()
    @IsNotEmpty()
    requiresCoordination: boolean;

    @IsOptional()
    @IsString()
    icon?: string;

    constructor(paymentOption: Partial<PaymentOption>) {
        super();
        Object.assign(this, paymentOption);

        this.recordId = paymentOption.recordId ?? uuidv4();
        this.createdAt = paymentOption.createdAt ?? getUTCDate().toISOString();
        this.updatedAt = getUTCDate().toISOString();
        this.recordType = DatabaseKeys.PAYMENT_OPTIONS;
        this.recordStatus = paymentOption.recordStatus ?? Status.ACTIVE;

        const optionSettings = paymentOptionSettings[paymentOption.paymentMethod as PaymentMethod];
        this.currency = optionSettings.currency;
        this.icon = optionSettings.icon;
        this.requiresCoordination = optionSettings.requiresCoordination;
    }
}
