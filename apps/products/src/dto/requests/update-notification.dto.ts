import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { EmailData } from 'apps/libs/entities/products/product-notification.entity';
import { Condition } from 'apps/libs/entities/common/condition.entity';

export class UpdateNotificationDto {
    @ApiPropertyOptional({
        description: 'Notification name',
        example: 'Plantilla por defecto',
    })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({
        description: 'Notification description',
        example: 'Este correo es enviado cuando una persona se registra al evento',
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({
        description: 'Email data',
        type: EmailData,
        example: {
            subject: '¡Hemos recibido tu reserva!',
            banner: {
                bgColor: '#f0f7ff',
                textColor: '#1f2937',
            },
            content:
                'Hola {{booking.user.fullName}} 👋, </br></br> Gracias por registrarte en {{product.name}}. Este correo contiene todos los detalles sobre tu reserva y lo que necesitas saber antes del evento. </br></br>Si tienes dudas o necesitas asistencia, no dudes en contactarnos.</br></br>¡Nos vemos pronto!',
        },
    })
    @IsOptional()
    @ApiProperty()
    @ValidateNested()
    @Type(() => EmailData)
    data?: EmailData;

    @ApiPropertyOptional({
        description: 'Email Conditions',
        type: [Condition],
        example: [
            {
                attribute: 'planId',
                operator: 'EQUAL',
                value: '123456',
            },
        ],
    })
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => Condition)
    conditions?: Condition[];

    @ApiPropertyOptional({
        description:
            "Set to 'true' if notification must be restored to initial values. Only valid for default notifications.",
        type: Boolean,
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    restore?: Boolean;
}
