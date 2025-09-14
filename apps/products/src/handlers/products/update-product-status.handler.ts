import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HostsRepository } from 'apps/libs/database/drizzle/repositories/hosts.repository';
import { ProductsRepository } from 'apps/libs/database/drizzle/repositories/products.repository';
import { ProductsErrorCodes } from 'apps/libs/common/constants/error-codes.constant';
import { ProductStatus } from 'apps/libs/common/enums/product-status.enum';
import { PaymentOptionsRepository } from 'apps/libs/database/drizzle/repositories/payment-options.repository';
import { ProductS3Service } from 'apps/libs/integrations/s3/product-s3.service';
import { TelegramRepository } from 'apps/libs/integrations/telegram/telegram.repository';
import { TelegramTemplate } from 'apps/libs/common/enums/telegram-template.enum';
import { ProductsDynamoRepository } from 'apps/libs/database/dynamodb/repositories/products.repository';
import { StatusRepository } from 'apps/libs/database/drizzle/repositories/status.repository';
import { mapProduct } from '../../utils/map-product';
import { UpdateProductStatusDto } from '../../dto/requests/update-product-status.dto';

@Injectable()
export class UpdateProductStatusHandler {
    private readonly cfDomain: string = this.configService.get('CLOUDFRONT_DOMAIN') as string;
    constructor(
        private readonly productsDynamoRepository: ProductsDynamoRepository,
        private readonly productsRepository: ProductsRepository,
        private readonly hostsRepository: HostsRepository,
        private readonly paymentOptionsRepository: PaymentOptionsRepository,
        private readonly productS3Service: ProductS3Service,
        private readonly configService: ConfigService,
        private readonly telegramRepository: TelegramRepository,
        private readonly statusRepository: StatusRepository,
    ) {}

    async execute(hostId: string, productId: string, updateProductStatusDto: UpdateProductStatusDto): Promise<void> {
        const { productStatus } = updateProductStatusDto;

        const product = await this.productsDynamoRepository.getProduct(hostId, productId);
        if (!product) throw new BadRequestException(ProductsErrorCodes.ProductNotFound);

        const host = await this.hostsRepository.findByRecordId(hostId);
        if (!host) throw new BadRequestException(ProductsErrorCodes.HostNotFound);
        const paymentOptions = await this.paymentOptionsRepository.findByHostId(host.id!);

        if (updateProductStatusDto.productStatus == ProductStatus.PUBLISHED) {
            const isReadyToBePublished = product.isReadyToBePublished(paymentOptions.length > 0);
            if (!isReadyToBePublished.result)
                throw new BadRequestException(isReadyToBePublished.message, {
                    cause: isReadyToBePublished.cause,
                });

            await this.telegramRepository.sendMessage({
                template: TelegramTemplate.PRODUCT_PUBLISHED,
                data: {
                    createdAt: new Date().toLocaleString('es-VE', { timeZone: 'America/Caracas' }),
                    hostAlias: host.alias,
                    productName: product.name,
                    productAlias: product.alias,
                    productType: product.productType,
                },
            });
        }

        await this.productsDynamoRepository.patchProduct(hostId, productId, { productStatus });
        const statusId = (await this.statusRepository.findByName(productStatus))?.id;
        await this.productsRepository.updateProduct(product.id!, { statusId });

        product.productStatus = productStatus;
        const mappedProduct = mapProduct(product, this.cfDomain);
        await this.productS3Service.addProductToS3(host.alias ?? '', mappedProduct);
    }
}
