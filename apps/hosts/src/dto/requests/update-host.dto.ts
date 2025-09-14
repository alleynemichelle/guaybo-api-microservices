import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsBoolean,
    IsOptional,
    IsNumber,
    ValidateNested,
    IsArray,
    IsEmail,
    IsTimeZone,
    IsObject,
    IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ValueItem } from 'apps/libs/domain/common/value-item.entity';
import { CommissionPayer } from 'apps/libs/common/enums/commission-payer.enum';

import { Item } from 'apps/libs/domain/common/item.entity';
import { Location } from 'apps/libs/domain/common/location.entity';
import { PhoneNumber } from 'apps/libs/domain/common/phone-number.entity';
import { MultimediaType } from 'apps/libs/common/enums/multimedia-type.enum';
import { MultimediaSource } from 'apps/libs/common/enums/multimedia-source.enum';
import { Logo } from './logo.dto';

export class UpdateHostDto {
    @ApiProperty({ description: 'Email address of the host.', example: 'john.doe@example.com', required: false })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiProperty({ description: 'Email address of the host.', example: 'supreme-extreme', required: false })
    @IsOptional()
    @IsString()
    alias?: string;

    @ApiProperty({
        description: 'Name of the host. It can be the name of the company',
        example: 'Juan Martinez',
        required: false,
    })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({
        description: 'Timezone of the host.',
        example: 'America/Caracas',
        type: String,
        required: false,
    })
    @IsOptional()
    @IsTimeZone()
    timezone?: string;

    @ApiProperty({
        description: 'Phone number of the host.',
        example: { code: '+58', number: '4142312123' },
        required: false,
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => PhoneNumber)
    phoneNumber?: PhoneNumber;

    @ApiProperty({
        description: 'Basic description of the host. ',
        example:
            '¡Hola! Soy Yaquelín y soy una apasionada del arte y las manualidades. Desde los 8 años he estado explorando y perfeccionando mi habilidad artística, encontrando en la arcilla creativa una forma única de expresión. <br/><br/> En mis cursos de arcilla creativa, aprenderás a transformar la arcilla en increíbles piezas de arte. Con más de 20 años de experiencia, te guiaré a través de técnicas y trucos que harán que tu creatividad florezca. Mis clases están diseñadas para todas las edades y niveles de habilidad, asegurándote una experiencia enriquecedora y divertida.',
        required: false,
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        description: 'Basic description of the host. ',
        example: {
            description: 'Logo.',
            filename: 'image.jpg',
            type: MultimediaType.IMAGE,
            source: MultimediaSource.APP,
        },
        required: false,
    })
    @IsOptional()
    @IsObject()
    logo?: Logo;

    @ApiPropertyOptional({ description: 'Does the logo have to be deleted?', example: true, required: false })
    @IsOptional()
    @IsBoolean()
    deleteLogo?: boolean;

    @ApiProperty({ description: 'Is this provider verified?', example: true, required: false })
    @IsOptional()
    @IsBoolean()
    verified?: boolean;

    @ApiPropertyOptional({
        type: Location,
        description: 'Host location',
        required: false,
        example: {
            country: 'Venezuela',
            state: 'Nueva Esparta',
            city: 'La Asunción',
            postalCode: '1203',
            description: 'Isla De Margarita',
        },
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => Location)
    location?: Location;

    @ApiPropertyOptional({
        type: ValueItem,
        required: false,
        description: 'Average response time of the host',
        example: {
            quantity: 30,
            unit: 'MIN',
        },
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => ValueItem)
    averageResponseTime?: ValueItem;

    @ApiPropertyOptional({
        type: [Item],
        required: false,
        description: 'Key features about the host',
        example: [
            {
                icon: 'deporte',
                description: 'Experto en deportes acuáticos.',
            },
        ],
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Item)
    keyFeatures?: Item[];

    @ApiPropertyOptional({
        type: [Item],
        required: false,
        description: 'Details about the host',
        example: [
            {
                icon: 'deporte',
                description: 'Experto en deportes acuáticos. Me encanta la adrenalina',
            },
        ],
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Item)
    details?: Item[];

    @ApiPropertyOptional({ example: 5, description: 'Rating of the host', required: false })
    @IsOptional()
    @IsNumber()
    rating?: number;

    @ApiPropertyOptional({ example: 0, description: 'Number of reviews the host has received', required: false })
    @IsOptional()
    @IsNumber()
    reviews?: number;

    @ApiPropertyOptional({ example: 0, description: 'Years of experience the host has', required: false })
    @IsOptional()
    @IsNumber()
    yearsOfExperience?: number;

    @ApiProperty({
        enum: CommissionPayer,
        description: 'Indicates if the app fee is paid by the host or the customer ',
        example: CommissionPayer.HOST,
        required: false,
    })
    @IsOptional()
    @IsEnum(CommissionPayer)
    commissionPayer?: CommissionPayer;

    @ApiPropertyOptional({
        example: [
            {
                value: 'Deportes acuáticos',
                icon: 'deporte',
                color: '#E0FFFF',
            },
        ],
        description: 'Host tags.',
        required: false,
    })
    @IsArray()
    @IsOptional()
    tags?: {
        value: string;
        icon?: string;
        color?: string;
    }[];
}
