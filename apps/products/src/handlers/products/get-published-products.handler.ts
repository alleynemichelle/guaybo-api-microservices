import { ConfigService } from '@nestjs/config';

import { ProductsDynamoRepository } from 'apps/libs/database/dynamodb/repositories/products.repository';
import { BaseProduct } from 'apps/libs/domain/products/product.entity';
import { mapProduct } from '../../utils/map-product';

export class GetPublishedProductsHandler {
    private readonly cfDomain: string = this.configService.get('CLOUDFRONT_DOMAIN') as string;
    constructor(
        private readonly productsDynamoRepository: ProductsDynamoRepository,
        private readonly configService: ConfigService,
    ) {}

    async execute(hostId: string): Promise<BaseProduct[]> {
        const products = await this.productsDynamoRepository.getPublishedProductsByHost(hostId);

        //  const enrichedProducts = await this.enrichProductsWithCoHosts(products);

        return products.map((product) => mapProduct(product, this.cfDomain));
    }

    //UTILITY FUNCTIONS
    //    private async enrichProductsWithCoHosts(products: BaseProduct[]): Promise<BaseProduct[]> {
    //     const coHostIds = [
    //         ...new Set(
    //             products.flatMap((product) => (product.coHosts ? product.coHosts.map((coHost) => coHost.hostId) : [])),
    //         ),
    //     ];

    //     if (coHostIds.length === 0) {
    //         return products;
    //     }

    //     const coHosts = await this.hostsRepository.getHostsByIds(coHostIds as string[]);
    //     const coHostsMap = new Map(coHosts.map((host) => [host.recordId, host]));

    //     products.forEach((product) => {
    //         if (product.coHosts) {
    //             product.coHosts = product.coHosts.map((coHost) => {
    //                 const hostData = coHostsMap.get(coHost.hostId);
    //                 return {
    //                     ...coHost,
    //                     name: hostData?.name,
    //                     alias: hostData?.alias,
    //                     logo: hostData?.logo ? this.addDomain(hostData.logo as Multimedia) : undefined,
    //                     description: hostData?.description,
    //                 };
    //             });
    //         }
    //     });

    //     return products;
    // }
}
