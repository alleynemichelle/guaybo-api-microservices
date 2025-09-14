import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { MultimediaSource } from 'apps/libs/common/enums/multimedia-source.enum';
import { MultimediaType } from 'apps/libs/common/enums/multimedia-type.enum';

export class Logo {
    @ApiProperty({ description: 'Image file name.', example: 'Logo.png' })
    @IsOptional()
    @IsString()
    filename: string;

    @ApiProperty({ description: 'Image path.', example: 'cdn/Logo.png' })
    @IsOptional()
    @IsString()
    path: string;

    @ApiProperty({ description: 'Multimedia type.', example: MultimediaType.IMAGE })
    @IsNotEmpty()
    @IsEnum(MultimediaType)
    type: MultimediaType;

    @ApiProperty({ description: 'Multimedia source.', example: MultimediaSource.APP })
    @IsNotEmpty()
    @IsEnum(MultimediaSource)
    source: MultimediaSource;

    @ApiProperty({ description: 'Logo description.', example: 'Logo.png', required: false })
    @IsOptional()
    @IsString()
    description?: string;
}
