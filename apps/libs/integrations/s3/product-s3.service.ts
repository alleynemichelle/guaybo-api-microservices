import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseProduct } from 'apps/libs/entities/products/product.entity';

import { S3Service } from './s3.service';

@Injectable()
export class ProductS3Service {
    private readonly s3Bucket: string;

    constructor(
        private readonly s3Service: S3Service,
        private readonly configService: ConfigService,
    ) {
        this.s3Bucket = this.configService.get('S3_BUCKET') as string;
    }

    public async addProductToS3(hostAlias: string, product: BaseProduct): Promise<void> {
        // Extract properties we don't want to store in S3
        const { postBookingSteps, discountCodes, meetingInvitation, ...tempProduct } = product;

        const thumbnail = {
            title: product.name,
            description: product.description ?? null,
            image: product.mainGallery?.[0]?.path ?? null,
        };

        await this.s3Service.uploadFile(
            this.s3Bucket,
            `public/metadata/${hostAlias}/${product.alias}.json`,
            Buffer.from(JSON.stringify(thumbnail), 'utf-8'),
            'application/json',
        );
    }

    public async deleteProductFromS3(hostAlias: string, productAlias: string): Promise<void> {
        await this.s3Service.deleteFile(this.s3Bucket, `public/metadata/${hostAlias}/${productAlias}.json`);
        await this.s3Service.deleteFile(this.s3Bucket, `public/listings/${hostAlias}/${productAlias}.json`);
    }

    /**
     * Deletes a product resource file from S3
     * @param url The URL of the resource to delete
     */
    public async deleteProductResourceFromS3(key: string): Promise<void> {
        try {
            await this.s3Service.deleteFile(this.s3Bucket, key);

            console.log(`Successfully deleted resource from S3 ${key}`);
        } catch (error) {
            console.error('Error deleting product resource from S3:', error);
            throw error;
        }
    }

    /**
     * Generates presigned URLs for a batch of product resource files
     * @param keys Array of S3 keys to generate presigned URLs for
     * @param expiresIn Expiration time in seconds for the presigned URL
     * @returns Object mapping the original keys to their presigned URLs
     */
    public async generateBatchPresignedUrls(keys: string[], expiresIn: number = 3600): Promise<Record<string, string>> {
        const result: Record<string, string> = {};

        // Process URLs in parallel with Promise.all for better performance
        const presignedUrlPromises = keys.map(async (key) => {
            try {
                // Generate presigned URL directly using the key
                const presignedUrl = await this.s3Service.createGetPresignedUrl(this.s3Bucket, key, expiresIn);

                // Store the result using the original key as the lookup value
                return { key, presignedUrl };
            } catch (error) {
                console.error(`Error generating presigned URL for key ${key}:`, error);
                return { key, presignedUrl: undefined };
            }
        });

        // Wait for all promises to resolve
        const results = await Promise.all(presignedUrlPromises);

        // Convert results array to the desired object format, only including valid URLs
        results.forEach(({ key, presignedUrl }) => {
            if (presignedUrl) {
                result[key] = presignedUrl;
            }
        });

        return result;
    }
}
