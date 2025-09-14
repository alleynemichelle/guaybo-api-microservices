import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

import { MultimediaSource } from 'apps/libs/common/enums/multimedia-source.enum';
import { Status } from 'apps/libs/common/enums/status.enum';

export class UpdateMultimediaDto {
    @ApiProperty({
        description: 'Order of the image on the preview',
        example: 1,
        required: false,
    })
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
        default: true,
    })
    @IsOptional()
    @IsBoolean()
    preview?: boolean;

    @ApiProperty({
        description: "Multimedia status. It won't be shown if it's inactive",
        example: Status.ACTIVE,
        required: false,
    })
    @IsEnum(Status, { each: true })
    @IsOptional()
    status?: Status;

    @ApiProperty({
        description: 'Source of the multimedia. ',
        example: MultimediaSource.APP,
        default: MultimediaSource.APP,
        required: false,
    })
    @IsOptional()
    @IsEnum(MultimediaSource, { each: true })
    source?: MultimediaSource;
}
