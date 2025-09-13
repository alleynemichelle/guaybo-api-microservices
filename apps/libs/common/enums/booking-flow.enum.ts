export enum BookingFlow {
    IGNORE_BOOKING = 'IGNORE_BOOKING', // don't generate booking, only redirect to whatsapp
    WHATSAPP_BOOKING = 'WHATSAPP_BOOKING', // generate booking, but payment is coordinated through whatsapp
    APP_BOOKING = 'APP_BOOKING', // the app coordinates the complete flow (booking and payments)
}
