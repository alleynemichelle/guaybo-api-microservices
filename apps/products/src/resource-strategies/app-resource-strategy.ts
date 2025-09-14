import { Injectable } from '@nestjs/common';
import { ProductS3Service } from 'apps/libs/integrations/s3/product-s3.service';
import { MultimediaSource } from 'apps/libs/common/enums/multimedia-source.enum';
import { extractPath } from 'apps/libs/common/utils/text-formatters';

import { CloudFrontCdnService } from 'apps/libs/integrations/cdn/cloudfront-cdn.service';
import { ResourceStrategy } from './resource-strategy.interface';
import { ConfigService } from '@nestjs/config';
import { ContentMode } from 'apps/libs/common/enums/content-mode.enum';

/**
 * Strategy to delete APP resources from S3
 */
@Injectable()
export class AppResourceStrategy implements ResourceStrategy {
    private readonly cfDomain: string;
    constructor(
        private readonly productS3Service: ProductS3Service,
        private readonly cloudFrontCdnService: CloudFrontCdnService,
        private readonly configService: ConfigService,
    ) {
        this.cfDomain = this.configService.get('CLOUDFRONT_DOMAIN') as string;
    }

    /**
     * Deletes a resource from S3
     * @param data The resource data
     */
    async deleteResource(data: { path?: string; url?: string; source: MultimediaSource }): Promise<void> {
        const urlPath = extractPath(data.url);
        const pathPath = extractPath(data.path);
        if (urlPath) await this.productS3Service.deleteProductResourceFromS3(urlPath);
        if (pathPath && pathPath !== urlPath) await this.productS3Service.deleteProductResourceFromS3(pathPath);
    }

    /**
     * Gets the public URL for the resource if source is APP
     * @param data The resource data
     */
    async getPublicUrl(
        data: { path?: string; url?: string; source: MultimediaSource },
        contentMode?: ContentMode,
    ): Promise<string> {
        const resourcePath = extractPath(data.url) || extractPath(data.path);
        if (!resourcePath) {
            throw new Error('Resource path is required to generate public URL');
        }

        if (resourcePath.includes('public')) {
            return `https://${this.cfDomain}/${resourcePath}`;
        }

        const filename = resourcePath.split('/').pop();
        return this.cloudFrontCdnService.generateSignedUrl(resourcePath, filename, contentMode);
    }
}
