import { Injectable } from '@nestjs/common';
import { PaymentProcessorType } from 'apps/libs/common/enums/payment-processor-type.enum';
import { IPaymentStrategy } from '../interfaces/payment-strategy.interface';
import { ManualPaymentStrategy } from '../strategies/payments/manual-payment.strategy';
import { AutomaticMobilePaymentStrategy } from '../strategies/payments/automatic-mobile-payment.strategy';

/**
 * Factory for creating appropriate payment strategies based on processor type
 */
@Injectable()
export class PaymentStrategyFactory {
    constructor(
        private readonly manualPaymentStrategy: ManualPaymentStrategy,
        private readonly automaticMobilePaymentStrategy: AutomaticMobilePaymentStrategy,
    ) {}

    /**
     * Creates the appropriate payment strategy for the given processor type
     */
    createStrategy(processorType: PaymentProcessorType): IPaymentStrategy {
        switch (processorType) {
            case PaymentProcessorType.MANUAL:
                return this.manualPaymentStrategy;
            case PaymentProcessorType.AUTOMATIC_MOBILE_PAYMENT:
                return this.automaticMobilePaymentStrategy;
            case PaymentProcessorType.STRIPE:
            case PaymentProcessorType.PAYPAL:
            default:
                throw new Error(`Payment processor type ${processorType} not supported`);
        }
    }

    /**
     * Gets all available strategies
     */
    getAllStrategies(): Record<string, IPaymentStrategy> {
        return {
            [PaymentProcessorType.MANUAL]: this.manualPaymentStrategy,
            [PaymentProcessorType.AUTOMATIC_MOBILE_PAYMENT]: this.automaticMobilePaymentStrategy,
        };
    }
}
