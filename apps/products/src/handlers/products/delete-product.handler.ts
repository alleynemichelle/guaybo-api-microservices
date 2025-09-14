import { BadRequestException, Injectable } from '@nestjs/common';
import { ProductsErrorCodes } from 'apps/libs/common/constants/error-codes.constant';
import { Status } from 'apps/libs/common/enums/status.enum';
import { HostsRepository } from 'apps/libs/database/drizzle/repositories/hosts.repository';
import { ProductsRepository } from 'apps/libs/database/drizzle/repositories/products.repository';
import { StatusRepository } from 'apps/libs/database/drizzle/repositories/status.repository';
import { ProductsDynamoRepository } from 'apps/libs/database/dynamodb/repositories/products.repository';
import { ProductS3Service } from 'apps/libs/integrations/s3/product-s3.service';

@Injectable()
export class DeleteProductHandlers {
    constructor(
        private readonly productsDynamoRepository: ProductsDynamoRepository,
        private readonly hostsRepository: HostsRepository,
        private readonly productsRepository: ProductsRepository,
        private readonly statusRepository: StatusRepository,
        private readonly productS3Service: ProductS3Service,
        //s   private readonly productResourcesService: ProductResourcesService,
    ) {}

    async execute(hostId: string, productId: string): Promise<void> {
        const product = await this.productsRepository.findByRecordIdWithTotalBookings(productId);
        if (!product) throw new BadRequestException(ProductsErrorCodes.ProductNotFound);

        const host = await this.hostsRepository.findByRecordId(hostId);
        if (!host) throw new BadRequestException(ProductsErrorCodes.HostNotFound);

        // delete product only if it doesn't have bookings
        // TODO: FIX THIS WHEN BOOKINGS WERE CREATED BASED ON PRODUCT
        if ((product?.totalBookings || 0) > 0) {
            console.log(`Product ${productId} has bookings. Updating record status`);
            const { recordId, name, alias, totalBookings, ...data } = product;

            const recordStatusId = (await this.statusRepository.findByName(Status.DELETED))?.id;
            await this.productsDynamoRepository.patchProduct(hostId, productId, { recordStatus: Status.DELETED });
            await this.productsRepository.updateProduct(product.id!, { recordStatusId });
        } else {
            console.log(`Product ${productId} doesn't bookings. Deleting product`);
            await this.productsDynamoRepository.deleteProduct(hostId, productId);
            await this.productsRepository.delete(host.id!, product.id!);
        }

        // deleting s3 related resources
        await this.productS3Service.deleteProductFromS3(host.alias!, product.alias!);

        // delete all product resources
        //   await this.productResourcesService.deleteAllProductResources(hostId, productId);
    }
}
