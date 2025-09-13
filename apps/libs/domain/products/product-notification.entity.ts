import { v4 as uuidv4 } from 'uuid';

import { IsOptional, IsString, ValidateNested, IsIn, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { getUTCDate } from 'apps/libs/common/utils/date';
import { DatabaseKeys } from 'apps/libs/common/enums/database-keys.enum';

import { Base } from '../common/base.entity';
import { Condition } from '../common/condition.entity';

export class Banner {
    @ApiProperty({ description: 'Banner background color. ', example: '#f0f7ff' })
    @IsString()
    bgColor: string;

    @ApiProperty({ description: 'Banner text color. ', example: '#1f2937' })
    @IsString()
    textColor: string;
}

export class EmailData {
    @ApiProperty({ example: '¡Hemos recibido tu reserva!' })
    @IsString()
    subject: string;

    @ApiProperty()
    @ValidateNested()
    @Type(() => Banner)
    banner: Banner;

    @ApiProperty({ example: 'Hola {{booking.user.fullName}} 👋, ...' })
    @IsString()
    content: string;
}

export class ProductNotification extends Base {
    @ApiProperty({ description: 'Type of notification. ', example: 'email' })
    @IsIn(['email'])
    @IsString()
    type: string;

    @ApiProperty({ description: 'Trigger of the notification.', example: 'BOOKING_CREATED' })
    @IsIn(['BOOKING_CREATED'])
    @IsString()
    event: string;

    @ApiProperty({
        description: 'Notification template key. It must exist on db',
        example: 'customer-booking-creation',
    })
    @IsString()
    templateKey: string;

    @ApiProperty({
        description: 'Notification name',
        example: 'Plantilla por defecto',
    })
    @IsString()
    name: string;

    @ApiPropertyOptional({
        description: 'Notification description',
        example: 'Este correo es enviado cuando una persona se registra al evento',
    })
    @IsString()
    description?: string;

    @ApiProperty()
    @ValidateNested()
    @Type(() => EmailData)
    data?: EmailData;

    @ApiPropertyOptional({
        description: 'Is this a default notification?',
        example: true,
        default: false,
    })
    @IsOptional()
    @IsBoolean()
    default?: boolean;

    @ApiPropertyOptional({ type: [Condition] })
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => Condition)
    conditions?: Condition[];

    @ApiPropertyOptional({
        description: 'Is this notification editable?',
        example: true,
    })
    @IsBoolean()
    editable?: boolean;

    @ApiPropertyOptional({
        description: 'Is this a system notification?',
        example: true,
    })
    @IsBoolean()
    system?: boolean;

    @ApiPropertyOptional({
        description: 'Who is the recipient of this notification?',
        example: 'customer',
        default: 'customer',
    })
    @IsIn(['customer', 'host'])
    @IsString()
    recipient?: string;

    constructor(notification: Partial<ProductNotification>) {
        super();
        Object.assign(this, notification);

        this.recordId = notification.recordId ?? uuidv4();
        this.createdAt = this.createdAt ?? getUTCDate().toISOString();
        this.recordType = DatabaseKeys.PRODUCT_NOTIFICATION;
        this.default = notification.default != undefined || notification.default != null ? notification.default : false;
        this.recipient = notification.recipient ?? 'customer';
    }
}
