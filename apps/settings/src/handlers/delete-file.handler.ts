import { S3Service } from 'apps/libs/integrations/s3/s3.service';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

import { DeleteS3FileDto } from '../dto/requests/delete-s3-file.dto';

@Injectable()
export class DeleteFileResponse {
    private readonly s3Bucket = this.configService.get('S3_BUCKET') as string;

    constructor(
        private readonly s3Service: S3Service,
        private readonly configService: ConfigService,
    ) {}

    async execute(deleteS3FileDto: DeleteS3FileDto): Promise<void> {
        try {
            await this.s3Service.deleteFile(this.s3Bucket, deleteS3FileDto.key);
        } catch (error: any) {
            console.error('Error creating presigned url: ', error);
            throw error;
        }
    }
}
