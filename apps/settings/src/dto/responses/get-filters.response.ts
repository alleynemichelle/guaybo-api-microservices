import { ApiProperty } from '@nestjs/swagger';
import { ResponseDto } from 'apps/libs/common/api/response.entity';
import { Filter } from 'apps/libs/domain/settings/filter.entity';

export class GetFiltersResponse extends ResponseDto {
    @ApiProperty({
        description: 'Get filters.',
        example: {
            invoices: {
                status: [
                    {
                        value: 'PENDING',
                        label: 'PENDING',
                    },
                    {
                        value: 'PAID',
                        label: 'PAID',
                    },
                    {
                        value: 'IN_PROGRESS',
                        label: 'IN_PROGRESS',
                    },
                    {
                        value: 'CONFIRMATION_PENDING',
                        label: 'CONFIRMATION_PENDING',
                    },
                    {
                        value: 'EXEMPT',
                        label: 'EXEMPT',
                    },
                ],
            },
            bookings: {
                bookingStatus: [
                    {
                        value: 'RECEIVED',
                        label: 'RECEIVED',
                    },
                    {
                        value: 'DELETED',
                        label: 'DELETED',
                    },
                ],
                services: [
                    {
                        value: '33d7b109-1d42-ac42-c27f-8d7ff89d5711',
                        label: 'Reto Sport planning',
                    },
                ],
                paymentMode: [
                    {
                        value: 'INSTALLMENTS',
                        label: 'INSTALLMENTS',
                    },
                    {
                        value: 'UPFRONT',
                        label: 'UPFRONT',
                    },
                ],
                paymentStatus: [
                    {
                        value: 'PENDING',
                        label: 'PENDING',
                    },
                    {
                        value: 'CONFIRMATION_PENDING',
                        label: 'CONFIRMATION_PENDING',
                    },
                    {
                        value: 'COMPLETED',
                        label: 'COMPLETED',
                    },
                    {
                        value: 'DELAYED',
                        label: 'DELAYED',
                    },
                    {
                        value: 'REFUNDED',
                        label: 'REFUNDED',
                    },
                ],
                plans: [
                    {
                        parent: {
                            value: '33d7b109-1d42-ac42-c27f-8d7ff89d5711',
                            label: 'Reto Sport Planning',
                        },
                        value: '12e7c109-1d42-ac42-c27f-8d7ff89d5711',
                        label: 'Plan Basic 🥈',
                    },
                    {
                        parent: {
                            value: '33d7b109-1d42-ac42-c27f-8d7ff89d5711',
                            label: 'Reto Sport Planning',
                        },
                        value: '22e7c109-1d42-ac42-c27f-8d7ff89d5711',
                        label: 'Plan Gold 🥇 ',
                    },
                    {
                        parent: {
                            value: '33d7b109-1d42-ac42-c27f-8d7ff89d5711',
                            label: 'Reto Sport Planning',
                        },
                        value: '33e7c109-1d42-ac42-c27f-8d7ff89d5711',
                        label: 'Plan Anual 🏆',
                    },
                ],
                paymentMethods: [
                    {
                        value: 'MOBILE_PAYMENT',
                        label: 'MOBILE_PAYMENT',
                    },
                    {
                        value: 'BINANCE',
                        label: 'BINANCE',
                    },
                    {
                        value: 'ZELLE',
                        label: 'ZELLE',
                    },
                    {
                        value: 'CASH',
                        label: 'CASH',
                    },
                ],
            },
            recordId: 'a33106d-a639-444c-a21a-f570938fcdb3',
        },
    })
    data: Filter;
}
