export enum PaymentStatus {
    PENDING = 'PENDING', // Payment has not been made
    PAYMENT_COORDINATION_PENDING = 'PAYMENT_COORDINATION_PENDING', // Payment is coordinated outside the platform. Host and customer must coordinate the payment delivery
    CONFIRMATION_PENDING = 'CONFIRMATION_PENDING', // Payment has been made but not yet confirmed by the host
    CONFIRMED = 'CONFIRMED', // Payment has been confirmed by the host
    REJECTED = 'REJECTED', // Payment has been rejected by the host
}
