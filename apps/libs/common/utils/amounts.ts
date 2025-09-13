import Decimal from 'decimal.js';

export function roundAmount(amount: number): string {
    return amount.toFixed(2);
}

export function roundToHalfUp(amount: number | string, decimals: number = 2): number {
    const dec = new Decimal(amount);

    if (dec.decimalPlaces() <= decimals) {
        return Number(dec.toString());
    }

    return Number(dec.toDecimalPlaces(decimals, Decimal.ROUND_HALF_UP).toString());
}

/**
 * Apply bankers rounding to all monetary values in an invoice object
 * @param invoice - The invoice object to round
 * @returns The invoice object with rounded values
 */
export function roundInvoiceAmounts(invoice: any): any {
    const rounded = { ...invoice };

    // Round main amounts
    if (typeof rounded.subtotal === 'number') {
        rounded.subtotal = roundToHalfUp(rounded.subtotal);
    }
    if (typeof rounded.billingTotal === 'number') {
        rounded.billingTotal = roundToHalfUp(rounded.billingTotal);
    }
    if (typeof rounded.total === 'number') {
        rounded.total = roundToHalfUp(rounded.total);
    }

    // Round payment total
    if (rounded.payment && typeof rounded.payment.total === 'number') {
        rounded.payment.total = roundToHalfUp(rounded.payment.total);
    }

    return rounded;
}

/**
 * Apply bankers rounding to all monetary values in a payment preview object
 * @param preview - The payment preview object to round
 * @returns The payment preview object with rounded values
 */
export function roundPaymentPreviewAmounts(preview: any): any {
    const rounded = { ...preview };

    // Round main amounts
    if (typeof rounded.subtotal === 'number') {
        rounded.subtotal = roundToHalfUp(rounded.subtotal);
    }
    if (typeof rounded.billingTotal === 'number') {
        rounded.billingTotal = roundToHalfUp(rounded.billingTotal);
    }

    // Round total amounts array
    if (Array.isArray(rounded.total)) {
        rounded.total = rounded.total.map((item: any) => ({
            ...item,
            ...(typeof item.amount === 'number' ? { amount: roundToHalfUp(item.amount) } : {}),
        }));
    }

    return rounded;
}
