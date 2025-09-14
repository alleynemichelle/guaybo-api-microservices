import { Injectable } from '@nestjs/common';
import { BunnyCdnService } from 'apps/libs/repositories/cdn/bunny-cdn.service';

import { MultimediaSource } from 'apps/libs/common/enums/multimedia-source.enum';
import { ResourceStrategy } from './resource-strategy.interface';
import { extractPath } from 'apps/libs/common/utils/text-formatters';

/**
 * Strategy to delete BUNNY_STREAM resources from BunnyCDN stream
 */
@Injectable()
export class BunnyStreamStrategy implements ResourceStrategy {
    private readonly defaultVideoPath = 'playlist.m3u8';
    constructor(private readonly bunnyCdnService: BunnyCdnService) {}

    /**
     * Deletes a video from BunnyCDN stream
     * @param videoId The video ID to delete in BunnyCDN stream
     */
    async deleteResource(data: { fileId?: string; source: MultimediaSource }): Promise<void> {
        if (!data.fileId) return;
        await this.bunnyCdnService.deleteStreamVideo(data.fileId);
    }

    /**
     * Gets the public URL for the resource if source is BUNNY_STREAM
     * @param data The resource data
     */
    async getPublicUrl(data: { path?: string; url?: string; source: MultimediaSource }): Promise<string> {
        const urlPath = data.url || data.path;
        if (!urlPath) {
            throw new Error('Resource path is required to generate public URL');
        }

        const urlObj = new URL(urlPath);
        const domain = urlObj.origin;
        const resourcePath = extractPath(urlPath);
        const filePath = `/${resourcePath}/${this.defaultVideoPath}`;
        const tokenPath = `/${resourcePath}/`;
        const token = this.bunnyCdnService.generateSignedToken(data.source, { filePath, tokenPath });

        return `${domain}/${token}${this.defaultVideoPath}`;
    }
}
