import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { FileType } from 'apps/libs/common/enums/file-type.enum';

export class CreatePresignedUrlDto {
    @ApiProperty({
        description: 'Name of the file to be uploaded',
        type: 'string',
        example: 'file.png',
    })
    @IsNotEmpty()
    @IsString()
    filename: string;

    @ApiProperty({
        description: 'Type of the file to be uploaded',
        example: FileType.HOST_INVOICE_PAYMENT,
    })
    @IsNotEmpty()
    @IsEnum(FileType)
    type: FileType;

    @ApiProperty({
        description: 'Data required for the file path template',
        type: 'object',
        example: {
            hostId: '12345',
            serviceId: '67890',
            invoiceId: 'abcde',
        },
    })
    @IsObject()
    data: {
        hostId?: string;
        serviceId?: string;
        invoiceId?: string;
    };

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
