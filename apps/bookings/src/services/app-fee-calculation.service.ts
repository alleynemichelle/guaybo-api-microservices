import { Injectable } from '@nestjs/common';
import { BillingPlan } from 'apps/libs/domain/billings/billing-plan.entity';
import { calculateAdjustment } from 'apps/libs/common/utils/billings';
import { CommissionPayer } from 'apps/libs/common/enums/commission-payer.enum';
import { roundToHalfUp } from 'apps/libs/common/utils/amounts';

@Injectable()
export class AppFeeCalculationService {
    calculateAppFee(
        billingPlan: BillingPlan,
        total: number,
    ): {
        amount: number;
        commissionPayer: CommissionPayer;
    } {
        if (total <= 0) return { amount: 0, commissionPayer: billingPlan.commissionPayer };
        const commission = billingPlan.breakdown.reduce((sum, item) => sum + calculateAdjustment(item, total), 0);

        return {
            amount: roundToHalfUp(commission),
            commissionPayer: billingPlan.commissionPayer,
        };
    }
}
