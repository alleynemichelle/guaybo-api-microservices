import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Condition } from 'apps/libs/entities/common/condition.entity';
import { EmailData } from 'apps/libs/entities/products/product-notification.entity';

export class CreateNotificationDto {
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

    @ApiProperty({
        description: 'Notification description',
        example: 'Este correo es enviado cuando una persona se registra al evento',
    })
    @IsString()
    description: string;

    @ApiProperty()
    @ValidateNested()
    @Type(() => EmailData)
    data: EmailData;

    @ApiPropertyOptional({ type: [Condition] })
    @ValidateNested({ each: true })
    @Type(() => Condition)
    conditions?: Condition[];

    @ApiPropertyOptional({
        description: 'Is this notification editable?',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    editable?: boolean;

    @ApiPropertyOptional({
        description: 'Is this a system notification?',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    system?: boolean;

    @ApiPropertyOptional({
        description: 'Who is the recipient of this notification?',
        example: 'customer',
    })
    @IsIn(['customer', 'host'])
    @IsString()
    recipient?: string;
}
