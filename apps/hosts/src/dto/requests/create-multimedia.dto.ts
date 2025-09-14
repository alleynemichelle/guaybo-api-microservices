import { ApiProperty } from '@nestjs/swagger';
import { MultimediaSource } from 'apps/libs/common/enums/multimedia-source.enum';
import { MultimediaType } from 'apps/libs/common/enums/multimedia-type.enum';
import { Status } from 'apps/libs/common/enums/status.enum';
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMultimediaDto {
    @ApiProperty({
        description: 'Tipo de archivo (imagen o video)',
        example: 'IMAGE',
        enum: MultimediaType,
    })
    @IsEnum(MultimediaType, { each: true })
    type: MultimediaType;

    @ApiProperty({
        description: 'URL of the image',
        example: 'public/hosts/ef133558-b66a-41bd-a250-8c4421fb01b9/image.jpg',
    })
    @IsNotEmpty()
    @IsString()
    path: string;

    @ApiProperty({
        description: 'Order of the image on the preview',
        example: 1,
    })
    @IsNumber()
    order: number;

    @ApiProperty({
        description: 'Description of the image (for SEO)',
        example: 'Una hermosa vista de la playa durante el atardecer.',
        required: false,
    })
    @IsOptional()
    @IsString()
    description: string;

    @ApiProperty({
        description: 'Is this multimedia part of the preview?',
        example: true,
        default: true,
    })
    @IsBoolean()
    preview: boolean;

    @ApiProperty({
        description: 'Is this multimedia part of the banner?',
        example: true,
    })
    @IsBoolean()
    isBanner: boolean;

    @ApiProperty({
        description: 'Is this multimedia the profile picture?',
        example: true,
        default: false,
    })
    @IsBoolean()
    profile: boolean;

    @ApiProperty({
        description: "Multimedia status. It won't be shown if it's inactive",
        example: Status.ACTIVE,
    })
    @ApiProperty({
        description: "Multimedia status. It won't be shown if it's inactive",
        example: Status.ACTIVE,
        required: false,
    })
    @IsEnum(Status, { each: true })
    status: Status;

    @ApiProperty({
        description: 'Source of the multimedia. ',
        example: MultimediaSource.APP,
        default: MultimediaSource.APP,
    })
    @IsEnum(MultimediaSource, { each: true })
    source: MultimediaSource;
}
