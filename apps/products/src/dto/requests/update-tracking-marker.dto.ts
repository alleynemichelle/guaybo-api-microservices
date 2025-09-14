import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTrackingMarkerDto {
    @ApiProperty({
        description: 'Id of the last resource visited',
        example: '33d7b109-1d42-ac42-c27f-8d7ff89d5711',
    })
    @IsString()
    @IsNotEmpty()
    resourceId: string;

    @ApiPropertyOptional({
        description: 'Seconds spent on the last resource',
        example: 10,
    })
    @IsNumber()
    @IsOptional()
    seconds?: number;
}
