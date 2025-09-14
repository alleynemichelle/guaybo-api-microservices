import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import * as crypto from 'crypto';

import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { MultimediaSource } from 'apps/libs/common/enums/multimedia-source.enum';

/**
 * DTO for creating a collection in Bunny.net
 */
export interface CreateCollectionDto {
    name: string;
}

/**
 * Response interface for a created collection in Bunny.net
 */
export interface CreateCollectionResponse {
    videoLibraryId: number;
    guid: string | null;
    name: string | null;
    videoCount: number;
    totalSize: number;
    previewVideoIds: string | null;
    previewImageUrls: string[] | null;
}

/**
 * Service to interact with Bunny.net video collections
 */
@Injectable()
export class BunnyCdnService {
    private readonly streamBaseUrl = 'https://video.bunnycdn.com/library';
    private readonly storageBaseUrl = 'https://ny.storage.bunnycdn.com';

    private readonly videoLibraryId = process.env.BUNNY_VIDEO_LIBRARY_ID || '';
    private readonly storageZoneName: string = process.env.BUNNY_STORAGE_ZONE_NAME || '';
    private readonly storageApiKey: string = process.env.BUNNY_STORAGE_API_KEY || '';
    private readonly streamApiKey: string = process.env.BUNNY_STREAM_API_KEY || '';
    private readonly storageTokenSecret: string = process.env.BUNNY_STORAGE_TOKEN_SECRET || '';
    private readonly streamTokenSecret: string = process.env.BUNNY_STREAM_TOKEN_SECRET || '';
    private readonly expirationDate: number = 3600;

    constructor(private readonly httpService: HttpService) {}

    /**
     * Create a new collection in Bunny.net
     * @param input Data to create the collection
     * @returns The created collection data
     */
    async createCollection(input: CreateCollectionDto): Promise<CreateCollectionResponse | undefined> {
        try {
            if (!this.videoLibraryId) {
                throw new Error('BUNNY_VIDEO_LIBRARY_ID must be defined in environment variables');
            }
            if (!this.streamApiKey) {
                throw new Error('BUNNY_STREAM_API_KEY must be defined in environment variables');
            }

            const url = `${this.streamBaseUrl}/${this.videoLibraryId}/collections`;
            const response: AxiosResponse = await firstValueFrom(
                this.httpService.post(url, input, {
                    headers: {
                        AccessKey: this.streamApiKey,
                        'Content-Type': 'application/json',
                    },
                }),
            );
            return response.data as CreateCollectionResponse;
        } catch (err: any) {
            console.log('Failed to create Bunny.net collection', err);
            return undefined;
        }
    }

    /**
     * Delete a file from Bunny.net storage
     * @param path Path to the file or directory inside the storage zone
     * @returns void if successful
     * @throws InternalServerErrorException if deletion fails
     */
    async deleteStorageResource(path: string): Promise<void> {
        try {
            const url = `${this.storageBaseUrl}/${this.storageZoneName}/${path}`;

            await firstValueFrom(
                this.httpService.delete(url, {
                    headers: {
                        AccessKey: this.storageApiKey,
                    },
                }),
            );
        } catch (err: any) {
            console.log('Failed to delete Bunny.net storage resource', err);
            return;
        }
    }

    /**
     * Delete a video from Bunny.net stream library
     * @param videoId The ID of the video to delete
     * @returns void if successful
     * @throws InternalServerErrorException if deletion fails
     */
    async deleteStreamVideo(videoId: string): Promise<void> {
        try {
            console.log('Deleting stream video', videoId);
            if (!this.videoLibraryId) {
                throw new Error('BUNNY_VIDEO_LIBRARY_ID must be defined in environment variables');
            }
            if (!this.streamApiKey) {
                throw new Error('BUNNY_STREAM_API_KEY must be defined in environment variables');
            }
            const url = `${this.streamBaseUrl}/${this.videoLibraryId}/videos/${videoId}`;
            await firstValueFrom(
                this.httpService.delete(url, {
                    headers: {
                        AccessKey: this.streamApiKey,
                    },
                }),
            );
        } catch (err: any) {
            console.log('Failed to delete Bunny.net stream video', err);
            return;
        }
    }

    /**
     * Build the BunnyCDN token hash and token string
     * @param secret Secret key for signing
     * @param path Path or tokenPath to sign
     * @param expires Expiration timestamp
     * @param ip Optional IP restriction
     * @param formatBcdnToken If true, returns bcdn_token format, else only hash
     * @returns Token string
     */
    private buildBunnyToken(secret: string, path: string, expires: number, ip?: string): string {
        // Build the string to sign
        const tokenString = `${secret}${path}${expires}${ip ?? ''}`;
        const hash = crypto
            .createHash('sha256')
            .update(tokenString)
            .digest('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        let token = `bcdn_token=${hash}&expires=${expires}&token_path=${path}`;
        if (ip) token += `&token_ip=${ip}`;
        return token;
    }

    /**
     * Generate a signed token for BunnyCDN Token Authentication (bcdn_token format)
     * @param source Multimedia source (BUNNY_STORAGE o BUNNY_STREAM)
     * @param options Parámetros para el token
     * @returns El token firmado en formato bcdn_token=...&expires=...&token_path=...
     */
    generateSignedToken(
        source: MultimediaSource,
        options: { filePath: string; expirationDate?: number; ip?: string; tokenPath?: string },
    ): string {
        const { filePath, expirationDate, ip, tokenPath } = options;
        // Use tokenPath for signing and as token_path if provided, otherwise use filePath
        const pathForToken = tokenPath ?? filePath;
        const expires = expirationDate ?? Math.floor(Date.now() / 1000) + this.expirationDate;
        const secret = source === MultimediaSource.BUNNY_STORAGE ? this.storageTokenSecret : this.streamTokenSecret;
        return this.buildBunnyToken(secret, pathForToken, expires, ip);
    }
}
