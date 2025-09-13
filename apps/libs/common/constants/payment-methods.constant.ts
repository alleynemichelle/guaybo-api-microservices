import { Currency } from '../enums/currency.enum';
import { PaymentMethod } from '../enums/payment-method.enum';

export const paymentOptionSettings = {
    [PaymentMethod.MOBILE_PAYMENT]: {
        icon: 'phone',
        requiresCoordination: false,
        currency: Currency.VES,
        customAttributes: {
            bank: { type: 'BANK', required: true },
            nationalId: { type: 'string', required: true },
            phoneNumber: { type: 'PHONE_NUMBER', required: true },
            name: { type: 'string', required: false },
            description: { type: 'string', required: false },
        },
    },
    [PaymentMethod.CASH]: {
        icon: 'cash',
        requiresCoordination: true,
        currency: Currency.USD,
        customAttributes: {
            description: { type: 'string', required: true },
        },
    },
    [PaymentMethod.ZELLE]: {
        icon: 'zelle',
        requiresCoordination: false,
        currency: Currency.USD,
        customAttributes: {
            email: { type: 'EMAIL', required: false },
            phoneNumber: { type: 'PHONE_NUMBER', required: false },
            name: { type: 'string', required: false },
            description: { type: 'string', required: false },
        },
    },
    [PaymentMethod.BINANCE]: {
        icon: 'binance',
        requiresCoordination: false,
        currency: Currency.USD,
        customAttributes: {
            email: { type: 'EMAIL', required: true },
            description: { type: 'string', required: false },
        },
    },
    [PaymentMethod.PAYPAL]: {
        icon: 'paypal',
        requiresCoordination: false,
        currency: Currency.USD,
        customAttributes: {
            name: { type: 'string', required: true },
            email: { type: 'EMAIL', required: true },
            username: { type: 'string', required: true },
            description: { type: 'string', required: false },
        },
    },
    [PaymentMethod.ZINLI]: {
        icon: 'zinli',
        requiresCoordination: false,
        currency: Currency.USD,
        customAttributes: {
            name: { type: 'string', required: true },
            email: { type: 'EMAIL', required: true },
            phoneNumber: { type: 'PHONE_NUMBER', required: false },
            description: { type: 'string', required: false },
        },
    },
    [PaymentMethod.AUTOMATIC_MOBILE_PAYMENT]: {
        icon: 'mobile',
        automatic: true,
        requiresCoordination: false,
        currency: Currency.VES,
        customAttributes: {
            bank: { type: 'BANK', required: true },
            nationalId: { type: 'string', required: true },
            phoneNumber: { type: 'PHONE_NUMBER', required: true },
        },
    },
};
