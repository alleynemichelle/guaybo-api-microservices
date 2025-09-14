import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

import { BunnyCdnService } from './bunny-cdn.service';
import { CloudFrontCdnService } from './cloudfront-cdn.service';

/**
 * Module to provide BunnyCdnService for CDN operations
 */
@Module({
    imports: [HttpModule, ConfigModule.forRoot()],
    providers: [BunnyCdnService, CloudFrontCdnService],
    exports: [BunnyCdnService, CloudFrontCdnService],
})
export class CdnModule {}
