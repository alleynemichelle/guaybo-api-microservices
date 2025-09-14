import { ApiProperty } from '@nestjs/swagger';
import { ResponseDto } from 'apps/libs/api/response.entity';
import { EventProduct } from 'apps/libs/entities/products/event.entity';

export class GetPublicProductResponse extends ResponseDto {
    @ApiProperty({
        description: 'Get public product response.',
        type: EventProduct,
        example: {
            template: {
                key: 'EVENT',
                sections: {
                    description: {
                        order: 2,
                    },
                    testimonials: {
                        order: 5,
                    },
                    faqs: {
                        order: 4,
                    },
                    hero: {
                        order: 1,
                    },
                    plans: {
                        order: 3,
                    },
                },
            },
            mainGallery: [
                {
                    path: 'https://d2fl1cbggyckhd.cloudfront.net/public/hosts/26b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a/products/f957593e-2ede-4b5c-bb92-8b47071ba06a/arcilla-1.png',
                    source: 'APP',
                    type: 'IMAGE',
                    order: 1,
                },
            ],
            banner: {
                path: 'https://d2fl1cbggyckhd.cloudfront.net/public/hosts/22b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a/products/18cfca37-1dd1-449d-882c-20f14c9c29c2/ezequiel-removebg-preview.png',
                source: 'APP',
                type: 'IMAGE',
                order: 1,
            },
            dates: [
                {
                    recordId: '629993678',
                    endDate: {
                        date: '2025-05-30',
                        time: '14:00',
                    },
                    initialDate: {
                        date: '2025-05-26',
                        time: '10:00',
                    },
                    totalBookings: 7,
                },
                {
                    recordId: '131991678',
                    endDate: {
                        date: '2025-06-30',
                        time: '14:00',
                    },
                    initialDate: {
                        date: '2025-06-26',
                        time: '10:00',
                    },
                    totalBookings: 4,
                },
            ],
            installments: {
                active: true,
                installmentsCount: 2,
                interestFee: {
                    type: 'FIXED',
                    amount: 3,
                },
                frequency: 'WEEKLY',
            },
            totalBookings: 11,
            name: 'evento de prueba',
            alias: 'evento-de-prueba',
            descriptionSection: [
                {
                    title: 'TITULO SECCION INICIAL',
                    content: 'DESCRIPCION DE LA SECCION INICIAL',
                },
            ],
            hostId: '26b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a',
            maxCapacity: 100,

            plans: [
                {
                    name: 'Básico',
                    recordId: '9515197498',
                    description: 'Curso de arcilla para principantes. Todos los materiales incluidos. ',
                    price: [
                        {
                            pricingModel: 'PER_PERSON',
                            symbol: '$',
                            amount: 80,
                            currency: 'USD',
                            fareType: 'GENERAL',
                        },
                    ],
                    tags: [
                        {
                            color: '#DBE9FE',
                            icon: 'clock',
                            value: '4 horas',
                        },
                    ],
                },
                {
                    name: 'Premium',
                    recordId: '1121197497',
                    description: 'Curso de arcilla premium.',
                    price: [
                        {
                            pricingModel: 'PER_PERSON',
                            symbol: '$',
                            amount: 100,
                            currency: 'USD',
                            fareType: 'GENERAL',
                        },
                    ],
                    tags: [
                        {
                            color: '#DBE9FE',
                            icon: 'clock',
                            value: '10 horas',
                        },
                    ],
                },
            ],
            gallery: [
                {
                    type: 'VIDEO',
                    path: 'https://path/image.png',
                    source: 'LINK',
                },
            ],
            productType: 'EVENT',
            location: {
                type: 'ONLINE',
            },
            faqs: [
                {
                    answer: 'No, este curso está diseñado para todos los niveles de habilidad, incluidos los principiantes. Nuestro instructor experto te guiará a través de cada paso del proceso.',
                    question: '¿Necesito experiencia previa para tomar este curso?',
                    order: 1,
                },
                {
                    answer: 'Sí, todos los materiales necesarios para esculpir, incluidos el barro y las herramientas, están proporcionados como parte del curso.',
                    question: '¿Están incluidos los materiales en el curso?',
                    order: 2,
                },
                {
                    answer: '¡Absolutamente! Podrás llevarte tu escultura terminada a casa para exhibirla y disfrutarla.',
                    question: '¿Puedo llevarme mi escultura a casa después de la clase?',
                    order: 3,
                },
                {
                    answer: 'Te recomendamos usar ropa cómoda que no te importe ensuciar, ya que trabajar con arcilla es una experiencia bastante práctica.',
                    question: '¿Qué debo ponerme para la clase?',
                    order: 4,
                },
            ],
            productStatus: 'PUBLISHED',
            createdAt: '2025-02-24T23:06:04.096Z',
            recordId: 'be58c945-a34d-4eec-9136-dc322d445bfa',
            mainDate: '2025-05-26T10:00:00',
            bookingSettings: {
                bookingFlow: 'APP_BOOKING',
                currencies: ['USD', 'VES'],
            },
            timezone: 'America/Caracas',
            paymentMethods: ['1235de3f-5be4-464a-8ad1-13abcb6b899e', 'e595de3f-5be4-464a-8ad1-b3abcb6b899e'],
            description: 'Curso de arcilla para principantes. Todos los materiales incluidos.',
            testimonials: [
                {
                    userName: 'Carlos Mendoza',
                    comment: '¡Excelente experiencia! El servicio fue maravilloso y todo estuvo perfecto.',
                    images: [
                        {
                            path: 'https://d2fl1cbggyckhd.cloudfront.net/public/hosts/26b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a/products/5aeb1d88-2e04-4c41-8d96-32bf516117b3/testimonials/testimonio-1.jpg',
                            source: 'APP',
                            type: 'IMAGE',
                            order: 1,
                        },
                    ],
                },
            ],
            discounts: [
                {
                    recordId: '5873885445',
                    amount: 20,
                    scope: 'TOTAL',
                    discountStatus: 'ACTIVE',
                    limit: 100,
                    name: 'Promoción semana santa.',
                    description: '20% off on total price',
                    validUntil: '2025-12-31',
                    validFrom: '2025-01-01',
                    conditions: [
                        {
                            value: '9515197498',
                            operator: 'EQUALS',
                            attribute: 'planId',
                        },
                    ],
                    type: 'PERCENTAGE',
                },
            ],
        },
    })
    data: EventProduct;
}
