import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreatePresignedUrlDto {
    @ApiProperty({
        description: 'ID of the selected product.',
        example: '2b160572-0835-4cee-9094-1a2b4663ffc4',
    })
    @IsUUID()
    productId: string;

    @ApiProperty({
        description: 'Name of the file to be uploaded',
        type: 'string',
        example: 'file.png',
    })
    @IsNotEmpty()
    @IsString()
    filename: string;

    @ApiProperty({
        description: 'Presigned url expiration in seconds.',
        type: 'number',
        example: 3600,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    expiresIn?: number;
}
