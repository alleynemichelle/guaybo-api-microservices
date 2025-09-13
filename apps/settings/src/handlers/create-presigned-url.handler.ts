import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

import { S3Service } from 'apps/libs/integrations/s3/s3.service';
import { FileType } from 'apps/libs/common/enums/file-type.enum';
import { CreatePresignedUrlDto } from '../dto/requests/create-presigned-url.dto';
import { filesPathReplacer } from '../utils/files-path-replacer';

@Injectable()
export class CreatePresignedUrlHandler {
    private readonly s3Bucket = this.configService.get('S3_BUCKET') as string;
    constructor(
        private readonly s3Service: S3Service,
        private readonly configService: ConfigService,
    ) {}

    async execute(createPresignedUrlDto: CreatePresignedUrlDto): Promise<{ url: string; path: string }> {
        try {
            const { filename, type, expiresIn, data } = createPresignedUrlDto;

            const path = FileType[type];
            const key = filesPathReplacer(path, { ...data, filename });

            const url = await this.s3Service.createPutPresignedUrl(this.s3Bucket, key, expiresIn ?? 3600);
            return { url, path: key };
        } catch (error: any) {
            console.error('Error creating presigned url: ', error);
            throw error;
        }
    }
}
