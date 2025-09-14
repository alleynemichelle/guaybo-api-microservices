import { Injectable } from '@nestjs/common';
import { BunnyCdnService } from 'apps/libs/repositories/cdn/bunny-cdn.service';

import { MultimediaSource } from 'apps/libs/common/enums/multimedia-source.enum';
import { extractPath } from 'apps/libs/common/utils/text-formatters';
import { ResourceStrategy } from './resource-strategy.interface';

/**
 * Strategy to delete BUNNY_STORAGE resources from BunnyCDN storage
 */
@Injectable()
export class BunnyStorageStrategy implements ResourceStrategy {
    constructor(private readonly bunnyCdnService: BunnyCdnService) {}

    /**
     * Deletes a resource from BunnyCDN storage
     * @param data The resource data
     */
    async deleteResource(data: { path?: string; url?: string; source: MultimediaSource }): Promise<void> {
        const urlPath = extractPath(data.url);
        const pathPath = extractPath(data.path);
        if (urlPath) await this.bunnyCdnService.deleteStorageResource(urlPath);
        if (pathPath && pathPath !== urlPath) await this.bunnyCdnService.deleteStorageResource(pathPath);
    }

    /**
     * Gets the public URL for the resource if source is BUNNY_STORAGE
     * @param data The resource data
     */
    async getPublicUrl(data: { path?: string; url?: string; source: MultimediaSource }): Promise<string> {
        const urlPath = data.url || data.path;
        if (!urlPath) {
            throw new Error('Resource path is required to generate public URL');
        }

        const resourcePath = extractPath(urlPath);
        const urlObj = new URL(urlPath);
        const domain = urlObj.origin;

        const token = this.bunnyCdnService.generateSignedToken(data.source, { filePath: `/${resourcePath}` });
        return `${domain}/${token}`;
    }
}
