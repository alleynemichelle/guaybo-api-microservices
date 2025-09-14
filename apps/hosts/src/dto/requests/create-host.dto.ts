import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsBoolean,
    IsOptional,
    IsNumber,
    ValidateNested,
    IsArray,
    IsEnum,
    IsNotEmpty,
    IsEmail,
    IsObject,
    IsTimeZone,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ValueItem } from 'apps/libs/domain/common/value-item.entity';
import { Item } from 'apps/libs/domain/common/item.entity';
import { Location } from 'apps/libs/domain/common/location.entity';
import { PhoneNumber } from 'apps/libs/domain/common/phone-number.entity';
import { Role } from 'apps/libs/common/enums/role.enum';
import { MultimediaType } from 'apps/libs/common/enums/multimedia-type.enum';
import { MultimediaSource } from 'apps/libs/common/enums/multimedia-source.enum';
import { Logo } from './logo.dto';

class UserDto {
    @ApiProperty({ description: 'Record ID of the user.', example: 'e2d159db-d956-43e8-ae6f-41a3ef7e2ec7' })
    @IsNotEmpty()
    @IsString()
    recordId: string;

    @ApiProperty({ description: 'Role of the user.', example: Role.ADMIN, enum: Role })
    @IsNotEmpty()
    @IsEnum(Role)
    role: Role;
}

export class CreateHostDto {
    @ApiProperty({ description: 'Email address of the host.', example: 'john.doe@example.com' })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'Host name',
        example: 'My Host Name',
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ description: 'Unique username of the host.', example: 'supreme-adventures' })
    @IsNotEmpty()
    @IsString()
    alias: string;

    @ApiProperty({
        description: 'Key of the billing plan for the host. Default: BASIC',
        required: false,
    })
    @IsNotEmpty()
    @IsString()
    plan: string;

    @ApiProperty({
        description: 'Timezone of the host.',
        example: 'America/Caracas',
        type: String,
    })
    @IsTimeZone()
    timezone: string;

    @ApiProperty({
        description: 'User information to associate host to user.',
        type: UserDto,
        required: true,
    })
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => UserDto)
    user: UserDto;

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
        description: 'Host description',
        example: 'Description of my host',
        required: false,
    })
    @IsString()
    @IsOptional()
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

    @ApiProperty({ required: false, description: 'Código del cupón', example: 'DESCUENTO10' })
    @IsOptional()
    @IsString()
    coupon?: string;
}
