import { Module } from '@nestjs/common';
import { DatabaseModule } from 'apps/libs/database/database.module';

import { ReferralsRepository } from './referrals.repository';
import { TemporalTokensRepository } from './temporal-tokens.repository';
import { UsersRepository } from './users.repository';
import { BillingPlansRepository } from './billing-plans.repository';
import { StatusRepository } from './status.repository';
import { PaymentOptionsRepository } from './payment-options.repository';
import { DiscountsRepository } from './discounts.repository';
import { SettingsRepository } from './settings.repository';
import { HostAnalyticsRepository } from './host-analytics.repository';
import { HostsRepository } from './hosts.repository';
import { RoleRepository } from './role.repository';
import { CustomersRepository } from './customers.repository';
import { ConfirmationCodesRepository } from './confirmation-codes.repository';
import { PaymentMethodsRepository } from './payment-methods.repository';
import { ProductsRepository } from './products.repository';
import { ProductTypesRepository } from './product-types.repository';
import { ProductDatesRepository } from './product-dates.repository';
import { ProductWeeklyAvailabilitiesRepository } from './product-weekly-availabilities.repository';
import { ProductPostBookingStepsRepository } from './product-post-booking-steps.repository';

@Module({
    imports: [DatabaseModule],
    providers: [
        // relational repositories
        ReferralsRepository,
        UsersRepository,
        BillingPlansRepository,
        StatusRepository,
        PaymentOptionsRepository,
        DiscountsRepository,
        SettingsRepository,
        HostAnalyticsRepository,
        HostsRepository,
        RoleRepository,
        CustomersRepository,
        ConfirmationCodesRepository,
        TemporalTokensRepository,
        PaymentMethodsRepository,
        ProductsRepository,
        HostsRepository,
        ProductTypesRepository,
        ProductDatesRepository,
        ProductWeeklyAvailabilitiesRepository,
        ProductPostBookingStepsRepository,
    ],
    exports: [
        // Relational repositories
        TemporalTokensRepository,
        ReferralsRepository,
        UsersRepository,
        BillingPlansRepository,
        StatusRepository,
        PaymentOptionsRepository,
        DiscountsRepository,
        SettingsRepository,
        HostAnalyticsRepository,
        HostsRepository,
        RoleRepository,
        CustomersRepository,
        ConfirmationCodesRepository,
        PaymentMethodsRepository,
        ProductsRepository,
        HostsRepository,
        ProductTypesRepository,
        ProductDatesRepository,
        ProductWeeklyAvailabilitiesRepository,
        ProductPostBookingStepsRepository,
    ],
})
export class DrizzleRepositoriesModule {}
