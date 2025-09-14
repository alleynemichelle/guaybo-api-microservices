import { TemplateType } from './telegram.types';

export const templates: Record<TemplateType, string> = {
    USER_CREATED: `[{stage}] ¡Nuevo usuario anfitrión registrado! 🎉

Detalles del nuevo usuario anfitrión:
- Fecha de registro: {createdAt} 
- Nombre: {firstName}
- Apellido: {lastName}
- Email: {email}
- Federado: {federated}`,

    PRODUCT_CREATED: `[{stage}] ¡Nuevo producto ha sido creado!✨

Detalles del producto:
- Fecha de creación: {createdAt} 
- Host: {hostAlias} 
- Producto: {productName}
- Alias: {productAlias}
- Tipo: {productType}
- Enlace: {frontendHost}/{hostAlias}/{productAlias}`,

    PRODUCT_PUBLISHED: `[{stage}] Un producto ha sido publicado! 🎉

Detalles del producto:
- Fecha de creación: {createdAt} 
- Host: {hostAlias} 
- Producto: {productName}
- Alias: {productAlias}
- Tipo: {productType}
- Enlace: {frontendHost}/{hostAlias}/{productAlias}`,

    PRODUCT_DUPLICATED: `[{stage}] ¡Nuevo producto ha sido duplicado!✨

Detalles del producto:
- Fecha de duplicación: {createdAt} 
- Host: {hostAlias} 
- Producto: {productName}
- Alias: {productAlias}
- Tipo: {productType}
- Enlace: {frontendHost}/{hostAlias}/{productAlias}`,
    BOOKING_CREATED: `[{stage}] ¡Nueva reserva realizada a través de Guaybo! 💶 💶 💶

Detalles de la reserva:
- Fecha: {createdAt} 
- Host: {hostAlias}
- Producto: {productName}
- Alias: {productAlias}
- Precio:  $ {bookingTotal}
- Comisión:  $ {bookingCommission} - {bookingCommissionPayer}
- Reserva de prueba: {isTest}
- Cliente: {clientName} - {clientEmail}
- Enlace del producto: {frontendHost}/{hostAlias}/{productAlias}
- Enlace: {frontendHost}/bookings/{bookingId}`,

    INVOICE_PAYMENT_CREATED: `[{stage}] 🚨🚨🚨 ¡Anfitrión ha realizado un pago! CONFIRMAR PAGO 🚨🚨🚨

Detalles del pago:
- Fecha de pago: {createdAt} 
- Host: {hostAlias}
- Invoice: {invoiceId}
- Total: $ {invoiceTotal}`,
};
