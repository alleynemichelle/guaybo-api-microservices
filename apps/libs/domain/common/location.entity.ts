import { ApiProperty } from '@nestjs/swagger';
import { LocationType } from 'apps/libs/common/enums/location-type.enum';
import { MeetingPlatform } from 'apps/libs/common/enums/meeting-platform.enum';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';

class LocationCoordinates {
    @ApiProperty({ description: 'Latitude of the location', example: 10.9576 })
    @IsNotEmpty()
    @IsNumber()
    latitude: number;

    @ApiProperty({ description: 'Longitude of the location', example: -63.864 })
    @IsNotEmpty()
    @IsNumber()
    longitude: number;
}

export class Location {
    @ApiProperty({
        enum: LocationType,
        description: 'Type of location',
        example: LocationType.ONLINE,
    })
    @IsEnum(LocationType)
    type: LocationType;

    @ApiProperty({
        enum: MeetingPlatform,
        description: 'Meeting platform for online sessions',
        example: MeetingPlatform.ZOOM,
        required: false,
    })
    @IsEnum(MeetingPlatform)
    @IsOptional()
    meetingPlatform?: MeetingPlatform;

    @ApiProperty({ description: 'Coordinates of the location', required: false })
    @ValidateNested()
    @IsOptional()
    @Type(() => LocationCoordinates)
    coordinates?: LocationCoordinates;

    @ApiProperty({ description: 'Country', example: 'Venezuela', required: false })
    @IsOptional()
    @IsString()
    country?: string;

    @ApiProperty({ description: 'State', example: 'Nueva Esparta', required: false })
    @IsOptional()
    @IsString()
    state?: string;

    @ApiProperty({ description: 'City', example: 'La Asunción', required: false })
    @IsOptional()
    @IsString()
    city?: string;

    @ApiProperty({ description: 'Postal code', example: '1271', required: false })
    @IsOptional()
    @IsString()
    postalCode?: string;

    @ApiProperty({
        description: 'Description of the location',
        example: 'Playa El Yaque, Isla de Margarita',
        required: false,
    })
    @IsOptional()
    @IsString()
    description?: string;
}
