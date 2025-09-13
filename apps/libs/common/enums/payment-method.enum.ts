export enum PaymentMethod {
    MOBILE_PAYMENT = 'MOBILE_PAYMENT',
    AUTOMATIC_MOBILE_PAYMENT = 'AUTOMATIC_MOBILE_PAYMENT',
    PAYPAL = 'PAYPAL',
    BINANCE = 'BINANCE',
    ZELLE = 'ZELLE',
    CASH = 'CASH',
    ZINLI = 'ZINLI',
}

export const PaymentMethodDefinition = {
    MOBILE_PAYMENT: {
        key: 'MOBILE_PAYMENT',
        name: 'Pago móvil',
        requiresCoordination: false,
        currency: 'VES',
    },
    PAYPAL: {
        key: 'PAYPAL',
        name: 'PayPal',
        requiresCoordination: false,
        currency: 'USD',
    },
    BINANCE: {
        key: 'BINANCE',
        name: 'Binance',
        requiresCoordination: false,
        currency: 'USD',
    },
    ZELLE: {
        key: 'ZELLE',
        name: 'Zelle',
        requiresCoordination: false,
        currency: 'USD',
    },
    CASH: {
        key: 'CASH',
        name: 'Efectivo',
        requiresCoordination: true,
        currency: 'USD',
    },
    ZINLI: {
        key: 'ZINLI',
        name: 'Zinli',
        requiresCoordination: false,
        currency: 'USD',
    },
};
