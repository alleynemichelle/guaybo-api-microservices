import { ProductStepType } from '../enums/product-step-type.enum';

export const postBookingSteps = {
    [ProductStepType.TEXT]: {
        icon: 'file',
    },
    [ProductStepType.LINK]: {
        icon: 'link',
        customAttributes: {
            url: { type: 'URL', required: true },
        },
    },
    [ProductStepType.WHATSAPP_GROUP]: {
        icon: 'whatsapp',
        customAttributes: {
            url: { type: 'URL', required: true },
        },
    },
    [ProductStepType.TELEGRAM_CHANNEL]: {
        icon: 'telegram',
        customAttributes: {
            url: { type: 'URL', required: true },
        },
    },
    [ProductStepType.DISCORD_CHANNEL]: {
        icon: 'telegram',
        customAttributes: {
            url: { type: 'URL', required: true },
        },
    },
    [ProductStepType.FORM]: {
        icon: 'form',
        customAttributes: {
            form: { type: 'FORM', required: true },
        },
    },
};
