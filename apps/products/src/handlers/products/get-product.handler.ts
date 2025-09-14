import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProductsErrorCodes } from 'apps/libs/common/constants/error-codes.constant';
import { Status } from 'apps/libs/common/enums/status.enum';
import { BaseProduct } from 'apps/libs/domain/products/product.entity';
import { HostsRepository } from 'apps/libs/database/drizzle/repositories/hosts.repository';

import { mapProduct } from '../../utils/map-product';
import { ProductsDynamoRepository } from 'apps/libs/database/dynamodb/repositories/products.repository';

@Injectable()
export class GetProductHandler {
    private readonly cfDomain: string = this.configService.get('CLOUDFRONT_DOMAIN') as string;
    constructor(
        private readonly productsDynamoRepository: ProductsDynamoRepository,
        private readonly hostsRepository: HostsRepository,
        private readonly configService: ConfigService,
    ) {}

    //PRODUCT
    async execute(
        hostId: string,
        productId: string,
        isPublic?: boolean,
    ): Promise<{
        product: BaseProduct;
        host: {
            recordId: string;
            name: string;
            email: string;
            tags?: {
                key: string;
                value: string;
            }[];
            phoneNumber?: {
                code: string;
                number: string;
            };
            description?: string;
            logo?: {
                recordId: string;
                path: string;
                source: string;
                type: string;
                order: number;
            };
        };
    }> {
        const host = await this.hostsRepository.findDetailsByRecordId(hostId);
        if (!host) throw new BadRequestException(ProductsErrorCodes.HostNotFound);

        let product = await this.productsDynamoRepository.getProduct(hostId, productId);
        if (!product || product.recordStatus == Status.DELETED)
            throw new BadRequestException(ProductsErrorCodes.ProductNotFound);

        //  [product] = await this.enrichProductsWithCoHosts([product]);

        const hostData = {
            recordId: host.recordId!,
            name: host.name,
            email: host.email,
            tags: host.tags as { key: string; value: string }[],
            ...(host.phoneNumber && { phoneNumber: host.phoneNumber }),
            ...(host.description && { description: host.description }),
            ...(host.logo && {
                logo: {
                    ...host.logo,
                    path: `https://${this.cfDomain}/${host.logo.path}`,
                    recordId: host.logo.recordId!,
                    order: host.logo.order || 1,
                },
            }),
        };

        if (isPublic) {
            const { postBookingSteps, discountCodes, ...publicProduct } = product;
            return {
                product: mapProduct(publicProduct as BaseProduct),
                host: hostData,
            };
        }

        return {
            product: mapProduct(product),
            host: hostData,
        };
    }
}
