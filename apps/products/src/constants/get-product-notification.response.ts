import { ApiProperty } from '@nestjs/swagger';
import { ResponseDto } from 'apps/libs/api/response.entity';
import { ProductNotification } from 'apps/libs/entities/products/product-notification.entity';

export class GetProductNotificationResponse extends ResponseDto {
    @ApiProperty({
        description: 'Get product notification response.',
        type: ProductNotification,
        example: [
            {
                recordId: 'd19311b6-df3c-4148-b7f0-5a8c7d641544',
                type: 'email',
                event: 'BOOKING_CREATED',
                templateKey: 'customer-booking-creation',
                default: true,
                data: {
                    banner: {
                        bgColor: '#f0f7ff',
                        textColor: '#1f2937',
                    },
                    content:
                        'Hola {{booking.user.fullName}} 👋, </br></br> Gracias por registrarte en {{product.name}}. Este correo contiene todos los detalles sobre tu reserva y lo que necesitas saber antes del evento. </br></br>Si tienes dudas o necesitas asistencia, no dudes en contactarnos.</br></br>¡Nos vemos pronto!',
                    subject: '¡Hemos recibido tu reserva x2!',
                },
            },
        ],
    })
    data: ProductNotification[];
}
