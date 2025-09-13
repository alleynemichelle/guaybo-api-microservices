import { AppEvent } from '../enums/app-event.enum';

export const productNotifications = {
    [AppEvent.BOOKING_CREATED]: [
        {
            type: 'email',
            event: 'BOOKING_CREATED',
            recordId: 'd19311b6-df3c-4148-b7f0-5a8c7d641544',
            templateKey: 'customer-booking-creation',
            name: 'Plantilla por defecto',
            description: 'Este correo es enviado cuando una persona se registra al evento',
            data: {
                subject:
                    '{{#if isReservationType}}¡Hemos recibido tu reserva!{{else}}¡Hemos recibido tu compra!{{/if}}',
                banner: {
                    bgColor: '#f0f7ff',
                    textColor: '#1f2937',
                },
                content: `Hola {{booking.user.fullName}} 👋, </br></br> Gracias por {{#if isReservationType}}registrarte en{{else}}tu compra de{{/if}} {{product.name}}. Este correo contiene todos los detalles sobre tu {{#if isReservationType}}reserva{{else}}compra{{/if}} y lo que necesitas saber {{#if isReservationType}}antes del evento{{/if}}. </br></br>Si tienes dudas o necesitas asistencia, no dudes en contactarnos.</br></br>{{#if isReservationType}}¡Nos vemos pronto!{{else}}¡Gracias por tu compra!{{/if}}`,
            },
            recipient: 'customer',
            editable: true,
            system: false,
            default: true,
        },
        {
            type: 'email',
            event: 'BOOKING_CREATED',
            templateKey: 'host-booking-creation',
            recipient: 'host',
            editable: false,
            system: false,
            default: true,
        },
    ],
    [AppEvent.FREE_BOOKING_CREATED]: [
        {
            type: 'email',
            event: 'FREE_BOOKING_CREATED',
            recordId: 'd19311b6-df3c-4148-b7f0-5a8c7d641545',
            templateKey: 'customer-free-booking-creation',
            name: 'Plantilla por defecto',
            description: 'Este correo es enviado cuando una persona se registra al evento gratuito',
            data: {
                subject:
                    '{{#if isReservationType}}¡Hemos recibido tu reserva!{{else}}¡Tu acceso al contenido ha sido confirmado!{{/if}}',
                banner: {
                    bgColor: '#f0f7ff',
                    textColor: '#1f2937',
                },
                content: `Hola {{booking.user.fullName}} 👋, </br></br> Gracias por {{#if isReservationType}}registrarte en{{else}}adquirir{{/if}} {{product.name}}. Este correo contiene todos los detalles sobre tu {{#if isReservationType}}reserva{{else}}acceso{{/if}}{{#if isReservationType}} y lo que necesitas saber antes del evento{{/if}}. </br></br>Si tienes dudas o necesitas asistencia, no dudes en contactarnos.</br></br>{{#if isReservationType}}¡Nos vemos pronto!{{else}}¡Disfruta tu contenido!{{/if}}`,
            },
            recipient: 'customer',
            editable: true,
            system: false,
            default: true,
        },
        {
            type: 'email',
            event: 'FREE_BOOKING_CREATED',
            templateKey: 'host-booking-creation',
            recipient: 'host',
            editable: false,
            system: false,
            default: true,
        },
    ],
};
