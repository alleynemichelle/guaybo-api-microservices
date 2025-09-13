import { NotificationSource } from 'apps/libs/common/enums/notification-source.enum';
import { Base } from '../common/base.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString, IsOptional, IsString, Length } from 'class-validator';

export class Notification extends Base {
    identifier: string;
    source: NotificationSource;
}

export class MBNotificaNotification extends Notification {
    @ApiProperty({
        description: 'Merchant ID - Cédula o RIF del Comercio (requerido) - String - 8 numérico (IdComercio)',
        example: '13536734',
    })
    @IsNotEmpty({ message: 'El campo merchantId es requerido' })
    @IsString()
    merchantId: string;

    @ApiProperty({
        description: 'Merchant Phone - Teléfono del comercio (requerido) - String - 11 numérico (TelefonoComercio)',
        example: '04121234567',
    })
    @IsNotEmpty({ message: 'El campo merchantPhone es requerido' })
    @IsNumberString()
    merchantPhone: string;

    @ApiProperty({
        description: 'Issuer Phone - Teléfono de origen del pago (requerido) - String - 11 numérico (TelefonoEmisor)',
        example: '04141234567',
    })
    @IsNotEmpty({ message: 'El campo issuerPhone es requerido' })
    @IsString({ message: 'El campo issuerPhone debe ser una cadena de texto' })
    issuerPhone: string;

    @ApiPropertyOptional({
        description: 'Description - Motivo del pago (opcional) - String - 30 alfanumérico (Concepto)',
        example: 'PRUEBA',
        required: false,
    })
    @IsOptional()
    @IsString({ message: 'El campo description debe ser una cadena de texto' })
    description?: string;

    @ApiProperty({
        description: 'Issuing Bank - Código del banco del pago (requerido) - String - 3 numérico (BancoEmisor)',
        example: '134',
    })
    @IsNotEmpty({ message: 'El campo issuingBank es requerido' })
    @IsString({ message: 'El campo issuingBank debe ser una cadena de texto' })
    issuingBank: string;

    @ApiProperty({
        description: 'Amount - Monto con decimales separados por punto (requerido) - String (Monto)',
        example: '123.13',
    })
    @IsNotEmpty({ message: 'El campo amount es requerido' })
    @IsString({ message: 'El campo amount debe ser una cadena de texto' })
    amount: string;

    @ApiProperty({
        description: 'Timestamp - Fecha y hora en formato ISO 8601 (requerido) - String (FechaHora)',
        example: '2024-12-05T16:50:48.421Z',
    })
    @IsNotEmpty({ message: 'El campo timestamp es requerido' })
    @IsString({ message: 'El campo timestamp debe ser una cadena de texto' })
    timestamp: string;

    @ApiProperty({
        description: 'Reference - Referencia interbancaria (requerido) - String (Referencia)',
        example: '83736278',
    })
    @IsNotEmpty({ message: 'El campo reference es requerido' })
    @IsString({ message: 'El campo reference debe ser una cadena de texto' })
    reference: string;

    @ApiProperty({
        description: 'Network Code - Código de respuesta de la red interbancaria (requerido) - String (CodigoRed)',
        example: '00',
    })
    @IsNotEmpty({ message: 'El campo networkCode es requerido' })
    @IsString({ message: 'El campo networkCode debe ser una cadena de texto' })
    @Length(2, 2, { message: 'El campo networkCode debe tener exactamente 2 caracteres' })
    networkCode: string;

    @ApiProperty({
        description: 'Original Payload - Objeto original de notificación recibido en el payload',
        example: {
            IdComercio: '13536734',
            TelefonoComercio: '04121234567',
            TelefonoEmisor: '04141234567',
            Concepto: 'PRUEBA',
            BancoEmisor: '134',
            Monto: '123.13',
            FechaHora: '2024-12-05T16:50:48.421Z',
            Referencia: '83736278',
            CodigoRed: '00',
        },
    })
    originalPayload: any;
}
