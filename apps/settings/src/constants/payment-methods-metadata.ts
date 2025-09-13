export const paymentMethodsMetadata = {
    BINANCE: {
        customAttributes: {
            description: {
                type: 'string',
                value: 'En el comprobante de pago debe contener el número de referencia de la transacción',
                required: false,
            },
            email: {
                type: 'EMAIL',
                value: 'ejemplo@gmail.com',
                required: true,
            },
        },
    },
    MOBILE_PAYMENT: {
        customAttributes: {
            description: {
                type: 'string',
                required: false,
            },
            bank: {
                type: 'BANK',
                required: true,
            },
            phoneNumber: {
                type: 'PHONE_NUMBER',
                required: true,
            },
            nationalId: {
                type: 'string',
                required: true,
            },
        },
    },
    CASH: {
        customAttributes: {
            description: {
                type: 'string',
                value: 'Te contactará el equipo interno para concretar el pago.',
                required: true,
            },
        },
    },
    ZELLE: {
        customAttributes: {
            email: {
                type: 'EMAIL',
                required: false,
            },
            phoneNumber: {
                type: 'PHONE_NUMBER',
                required: false,
            },
            name: {
                type: 'string',
                required: false,
            },
            description: {
                type: 'string',
                required: false,
            },
        },
    },
    PAYPAL: {
        customAttributes: {
            name: {
                type: 'string',
                required: true,
            },
            email: {
                type: 'EMAIL',
                required: true,
            },
            username: {
                type: 'string',
                required: true,
            },
            description: {
                type: 'string',
                required: false,
            },
        },
    },
    ZINLI: {
        customAttributes: {
            name: {
                type: 'string',
                required: true,
            },
            email: {
                type: 'EMAIL',
                required: true,
            },
            phoneNumber: {
                type: 'PHONE_NUMBER',
                required: false,
            },
            description: {
                type: 'string',
                required: false,
            },
        },
    },
    AUTOMATIC_MOBILE_PAYMENT: {
        customAttributes: {
            bank: {
                type: 'BANK',
                required: true,
            },
            nationalId: {
                type: 'string',
                required: true,
            },
            phoneNumber: {
                type: 'PHONE_NUMBER',
                required: true,
            },
        },
    },
};
