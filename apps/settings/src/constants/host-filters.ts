import { BookingPaymentStatus } from 'apps/libs/common/enums/booking-payment-status.enum';
import { BookingStatus } from 'apps/libs/common/enums/booking-status.enum';
import { EventStatus } from 'apps/libs/common/enums/event-status.enum';
import { InvoiceStatus } from 'apps/libs/common/enums/invoice-status.enum';
import { PaymentMode } from 'apps/libs/common/enums/payment-mode.enum';
import { ProductStatus } from 'apps/libs/common/enums/product-status.enum';

interface FilterField {
    name: string;
    key: string;
}

interface Filter {
    name: string;
    key: string;
    filter: {
        name: string;
        key: string;
    };
    fields: FilterField[];
}

interface StaticFilterValues {
    [key: string]: { value: string; count: number }[];
}

export const staticValues: StaticFilterValues = {
    eventStatus: Object.values(EventStatus).map((value) => ({ value, count: 0 })),
    productStatus: Object.values(ProductStatus).map((value) => ({ value, count: 0 })),
    invoiceStatus: Object.values(InvoiceStatus).map((value) => ({ value, count: 0 })),
    paymentMode: Object.values(PaymentMode).map((value) => ({ value, count: 0 })),
    paymentStatus: Object.values(BookingPaymentStatus).map((value) => ({ value, count: 0 })),
    bookingStatus: Object.values(BookingStatus).map((value) => ({ value, count: 0 })),
};

export function getHostFilters(stage: string, project: string): Filter[] {
    const hostFilters = {
        invoicesIndex: `${stage}-${project}-invoices-index`,
        bookingsIndex: `${stage}-${project}-bookings-index`,
        eventsIndex: `${stage}-${project}-events-index`,
        customersIndex: `${stage}-${project}-customers-index`,
        productsIndex: `${stage}-${project}-products-index`,
    };

    const filters = [
        {
            name: hostFilters.customersIndex,
            key: 'customers',
            filter: { name: 'host', key: 'hostId.keyword' },
            fields: [{ name: 'tags', key: 'tags.value.keyword' }],
        },
        {
            name: hostFilters.invoicesIndex,
            key: 'invoices',
            filter: { name: 'host', key: 'hostId.keyword' },
            fields: [{ name: 'invoiceStatus', key: 'status.keyword' }],
        },
        {
            name: hostFilters.productsIndex,
            key: 'events',
            filter: { name: 'host', key: 'hostId.keyword' },
            fields: [{ name: 'productStatus', key: 'productStatus.keyword' }],
        },
        {
            name: hostFilters.bookingsIndex,
            filter: { name: 'host', key: 'hostId.keyword' },
            key: 'bookings',
            fields: [
                { name: 'paymentMode', key: 'paymentMode.keyword' },
                { name: 'paymentStatus', key: 'paymentStatus.keyword' },
                { name: 'paymentMethods', key: 'paymentMethod.keyword' },
                { name: 'bookingStatus', key: 'bookingStatus.keyword' },
                { name: 'services', key: 'serviceTitle.keyword' },
                { name: 'plans', key: 'planTitle.keyword' },
                { name: 'tags', key: 'tags.value.keyword' },
            ],
        },
    ];

    return filters;
}
