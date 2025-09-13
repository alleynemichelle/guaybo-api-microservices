import { ApiProperty } from '@nestjs/swagger';
import {
    IsBoolean,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    registerDecorator,
    ValidateNested,
    ValidationArguments,
    ValidationOptions,
} from 'class-validator';
import { Type } from 'class-transformer';

import { MultimediaSource } from 'apps/libs/common/enums/multimedia-source.enum';
import { MultimediaType } from 'apps/libs/common/enums/multimedia-type.enum';
import { Status } from 'apps/libs/common/enums/status.enum';
import { Base } from './base.entity';

export function IsFilenameOrPath(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isFilenameOrPath',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const object = args.object as any;
                    return !!object.filename || !!object.path;
                },
                defaultMessage(args: ValidationArguments) {
                    return 'Either filename or path must be provided.';
                },
            },
        });
    };
}

export class Multimedia extends Base {
    @ApiProperty({
        description: 'Type of the file (imagen o video)',
        example: 'IMAGE',
        enum: MultimediaType,
    })
    @IsString()
    @IsEnum(MultimediaType, { each: true })
    type: MultimediaType;

    @ApiProperty({
        description: 'Source of the multimedia. ',
        example: MultimediaSource.APP,
        default: MultimediaSource.APP,
        enum: MultimediaSource,
    })
    @IsNotEmpty()
    @IsEnum(MultimediaSource, { each: true })
    source: MultimediaSource;

    @ApiProperty({
        description: 'Name of the multimedia resource. It should be filename or path',
        example: 'image.jpg',
        required: false,
    })
    @IsFilenameOrPath()
    @IsOptional()
    @IsString()
    filename?: string;

    @ApiProperty({
        description: 'URL of the image',
        example: 'https://path/image.png',
        required: false,
    })
    @IsFilenameOrPath()
    @IsOptional()
    @IsString()
    path?: string;

    @ApiProperty({
        description: 'Order of the image on the preview',
        example: 1,
        required: false,
        default: 1,
    })
    @IsOptional()
    @IsNumber()
    order?: number;

    @ApiProperty({
        description: 'Description of the image (for SEO)',
        example: 'Una hermosa vista de la playa durante el atardecer.',
        required: false,
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        description: 'Is this multimedia part of the preview?',
        example: true,
        required: false,
        default: false,
    })
    @IsOptional()
    @IsBoolean()
    preview?: boolean;

    @ApiProperty({
        description: 'Is this multimedia part of the banner?',
        example: true,
        required: false,
        default: false,
    })
    @IsOptional()
    @IsBoolean()
    isBanner?: boolean;

    @ApiProperty({
        description: 'Is this multimedia the profile picture?',
        example: true,
        default: false,
        required: false,
    })
    @IsOptional()
    @IsBoolean()
    profile?: boolean;

    @ApiProperty({
        description: "Multimedia status. It won't be shown if it's inactive",
        required: false,
        example: Status.ACTIVE,
        default: Status.ACTIVE,
        enum: Status,
    })
    @IsOptional()
    @IsEnum(Status, { each: true })
    status?: Status;

    @ApiProperty({
        description: 'URL of the image thumbnail',
        example: 'public/image.jpg',
        required: false,
    })
    @IsOptional()
    @IsString()
    thumbnailPath?: string;

    @ApiProperty({
        description: 'Thumbnail object containing source and path',
        type: Multimedia,
        required: false,
        example: {
            type: MultimediaType.IMAGE,
            source: MultimediaSource.APP,
            path: 'image.jpg',
        },
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => Multimedia)
    thumbnail?: Multimedia;
}
