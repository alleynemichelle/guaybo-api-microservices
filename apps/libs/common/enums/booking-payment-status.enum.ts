export enum BookingPaymentStatus {
    CONFIRMATION_PENDING = 'CONFIRMATION_PENDING', // Pago pendiente de confirmación
    COMPLETED = 'COMPLETED', // Pago completado
    DELAYED = 'DELAYED', // Pago moroso
    REFUNDED = 'REFUNDED', // Pago reembolsado
    PENDING = 'PENDING',
}
