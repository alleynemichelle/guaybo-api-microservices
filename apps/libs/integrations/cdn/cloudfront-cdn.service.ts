import { Injectable } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { getSignedUrl, getSignedCookies } from '@aws-sdk/cloudfront-signer';
import { ContentMode } from 'apps/libs/common/enums/content-mode.enum';

@Injectable()
export class CloudFrontCdnService {
    private readonly cfDomain: string = this.configService.get('CLOUDFRONT_DOMAIN') as string;
    private readonly cfKeyPairId: string = this.configService.get('CLOUDFRONT_KEY_PAIR_ID') as string;
    private readonly cfPrivateKey: string = this.configService.get('CLOUDFRONT_PRIVATE_KEY') as string;
    private readonly expirationDate: number = 15;

    constructor(private readonly configService: ConfigService) {}

    /**
     * Generates a signed CloudFront URL for the given resource path
     * @param resourcePath The resource path to sign
     * @param filename The filename for the resource
     * @param contentMode The content mode for the resource
     * @returns The signed CloudFront URL
     */
    generateSignedUrl(resourcePath: string, filename?: string, contentMode?: ContentMode): string {
        try {
            const cleanPath = resourcePath.startsWith('/') ? resourcePath.substring(1) : resourcePath;
            const expireTime = Math.floor(Date.now() / 1000) + this.expirationDate;
            let fullUrl = `https://${this.cfDomain}/${cleanPath}`;

            if (contentMode === ContentMode.ATTACHMENT && filename) {
                const attachmentParams = new URLSearchParams({
                    dl: '1',
                    name: filename,
                });
                fullUrl = `${fullUrl}?${attachmentParams.toString()}`;
            }

            const signedUrl = getSignedUrl({
                url: fullUrl,
                keyPairId: this.cfKeyPairId,
                privateKey: this.cfPrivateKey,
                dateLessThan: new Date(expireTime * 1000).toISOString(),
            });

            if (!signedUrl.includes('Key-Pair-Id') || !signedUrl.includes('Signature')) {
                throw new Error('Signed URL does not contain required parameters');
            }

            return signedUrl;
        } catch (error: any) {
            console.error('Error generating CloudFront signed URL:', error);
            return resourcePath;
        }
    }

    /**
     * Generates CloudFront signed cookies for accessing product resources
     * @param productId The product ID to grant access to
     * @param expirationMinutes Expiration time in minutes (default: 30)
     * @returns Object with cookie names and values
     */
    generateSignedCookies(url: string, expirationMinutes: number = 30): Record<string, string> {
        try {
            const expireTime = Math.floor(Date.now() / 1000) + expirationMinutes * 60;

            const policy = JSON.stringify({
                Statement: [
                    {
                        Resource: url,
                        Condition: {
                            DateLessThan: { 'AWS:EpochTime': expireTime },
                        },
                    },
                ],
            });

            const cookies = getSignedCookies({
                keyPairId: this.cfKeyPairId,
                privateKey: this.cfPrivateKey,
                policy,
            });

            console.log(`Generated CloudFront signed cookies for ${url}, expires in ${expirationMinutes} minutes`);
            return cookies as unknown as Record<string, string>;
        } catch (error: any) {
            console.error('Error generating CloudFront signed cookies:', error);
            throw new Error(`Failed to generate signed cookies: ${error.message}`);
        }
    }
}
