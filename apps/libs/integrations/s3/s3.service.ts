import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    ListObjectsV2Command,
    CopyObjectCommand,
    DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { CloudFrontClient, CreateInvalidationCommand } from '@aws-sdk/client-cloudfront';
import { Readable } from 'stream';

@Injectable()
export class S3Service {
    private s3Client: S3Client;
    private cloudFrontClient: CloudFrontClient;
    private region: string;
    private distributionId: string;

    constructor(private configService: ConfigService) {
        this.region = this.configService.get('REGION') || '';
        this.distributionId = this.configService.get('CLOUDFRONT_DISTRIBUTION_ID') || '';
    }

    private initClients() {
        if (!this.s3Client) {
            this.s3Client = new S3Client({ region: this.region, forcePathStyle: true });
        }
        if (!this.cloudFrontClient) {
            this.cloudFrontClient = new CloudFrontClient({ region: this.region });
        }
        return { s3: this.s3Client, cloudFront: this.cloudFrontClient };
    }

    public async createPutPresignedUrl(bucket: string, key: string, expiresIn: number = 3600) {
        const { s3 } = this.initClients();

        const command = new PutObjectCommand({
            Bucket: bucket,
            Key: key,
        });

        return getSignedUrl(s3, command, { expiresIn });
    }

    public async createGetPresignedUrl(bucket: string, key: string, expiresIn: number = 3600) {
        const { s3 } = this.initClients();
        console.log(`Creating presigned URL for bucket: ${bucket} and key: ${key}`);

        const command = new GetObjectCommand({
            Bucket: bucket,
            Key: key,
        });

        return getSignedUrl(s3, command, { expiresIn });
    }

    public async renameFolder(bucket: string, oldFolder: string, newFolder: string): Promise<void> {
        const { s3 } = this.initClients();

        try {
            // list files
            const listCommand = new ListObjectsV2Command({
                Bucket: bucket,
                Prefix: oldFolder + '/',
            });
            const listResponse = await s3.send(listCommand);
            if (!listResponse.Contents || listResponse.Contents.length === 0) {
                console.log(`No objects found in folder: ${oldFolder}`);
                return;
            }

            // copy files
            const copyPromises = listResponse.Contents.map(async (object) => {
                if (!object.Key) return;

                console.log('copying ', object.Key);
                const newKey = object.Key.replace(oldFolder, newFolder);
                const copyCommand = new CopyObjectCommand({
                    Bucket: bucket,
                    CopySource: `${bucket}/${encodeURIComponent(object.Key)}`,
                    Key: newKey,
                });

                return s3.send(copyCommand);
            });

            await Promise.all(copyPromises);

            // delete old files
            const deletePromises = listResponse.Contents.map(async (object) => {
                if (!object.Key) return;

                console.log('deleting ', object.Key);
                const deleteCommand = new DeleteObjectCommand({
                    Bucket: bucket,
                    Key: object.Key,
                });
                return s3.send(deleteCommand);
            });

            await Promise.all(deletePromises);

            console.log(`Folder renamed from ${oldFolder} to ${newFolder} successfully.`);
        } catch (error) {
            console.error('Error renaming folder in S3:', error);
            throw error;
        }
    }

    public async uploadFile(
        bucket: string,
        key: string,
        file: Buffer | Readable | string,
        contentType: string,
    ): Promise<void> {
        const { s3 } = this.initClients();

        try {
            const command = new PutObjectCommand({
                Bucket: bucket,
                Key: key,
                Body: file,
                ContentType: contentType,
            });

            await s3.send(command);
            console.log(`File uploaded successfully to ${bucket}/${key}`);
        } catch (error) {
            console.error('Error uploading file to S3:', error);
            throw error;
        }
    }

    public async deleteFile(bucket: string, key: string): Promise<void> {
        const { s3 } = this.initClients();

        try {
            const command = new DeleteObjectCommand({
                Bucket: bucket,
                Key: key,
            });

            await s3.send(command);
            console.log(`File deleted successfully from ${bucket}/${key}`);
        } catch (error) {
            console.error('Error deleting file from S3:', error);
            throw error;
        }
    }

    public async invalidateCloudFrontCache(paths: string[]): Promise<void> {
        const { cloudFront } = this.initClients();

        if (!this.distributionId) {
            console.warn('No CloudFront distribution ID configured. Skipping cache invalidation.');
            return;
        }

        try {
            console.log('Iniciando invalidación de caché con los siguientes parámetros:');
            console.log('Distribution ID:', this.distributionId);
            console.log('Paths a invalidar:', paths);

            const command = new CreateInvalidationCommand({
                DistributionId: this.distributionId,
                InvalidationBatch: {
                    CallerReference: Date.now().toString(),
                    Paths: {
                        Quantity: paths.length,
                        Items: paths,
                    },
                },
            });

            const result = await cloudFront.send(command);
            console.log('Resultado de la invalidación:', result);
        } catch (error) {
            console.error('Error detallado al crear invalidación de CloudFront:', error);
            throw error;
        }
    }
}
