import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteS3FileDto {
    @ApiProperty({
        description: 'File key in S3 Bucket',
        type: 'string',
        example: 'path/file.png',
    })
    @IsNotEmpty()
    @IsString()
    key: string;
}
