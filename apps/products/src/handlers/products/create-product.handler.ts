import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { BaseProduct } from 'apps/libs/domain/products/product.entity';
import { mapProduct } from '../../utils/map-product';

import { ProductsRepository } from 'apps/libs/database/drizzle/repositories/products.repository';
import { ProductsDynamoRepository } from 'apps/libs/database/dynamodb/repositories/products.repository';
import { HostsRepository } from 'apps/libs/database/drizzle/repositories/hosts.repository';
import { ProductS3Service } from 'apps/libs/integrations/s3/product-s3.service';
import { TelegramRepository } from 'apps/libs/integrations/telegram/telegram.repository';

import { ProductsErrorCodes } from 'apps/libs/common/constants/error-codes.constant';
import { cleanAlias } from 'apps/libs/common/utils/text-formatters';
import { setProduct } from 'apps/libs/domain/products/product-factory';
import { LocationType } from 'apps/libs/common/enums/location-type.enum';
import { ProductType } from 'apps/libs/common/enums/product-type.enum';
import { TelegramTemplate } from 'apps/libs/common/enums/telegram-template.enum';

import { CreateProductDto } from '../../dto/requests/create-product.dto';
import { processProductDates } from '../../utils/process-product-dates';
import { validateWeeklyAvailability } from '../../utils/validate-availability';

@Injectable()
export class CreateProductHandler {
    private readonly cfDomain: string = this.configService.get('CLOUDFRONT_DOMAIN') as string;
    constructor(
        private readonly productsDynamoRepository: ProductsDynamoRepository,
        private readonly hostsRepository: HostsRepository,
        private readonly productRepository: ProductsRepository,
        private readonly productS3Service: ProductS3Service,
        private readonly telegramRepository: TelegramRepository,
        private readonly configService: ConfigService,
    ) {}

    async execute(createProductDto: CreateProductDto): Promise<BaseProduct> {
        // validate dates and weekly availability
        if (createProductDto.dates) createProductDto.dates = processProductDates(createProductDto.dates);
        if (createProductDto.weeklyAvailability) validateWeeklyAvailability(createProductDto.weeklyAvailability);

        // validate host
        const host = await this.hostsRepository.findByRecordId(createProductDto.hostId);
        if (!host) throw new BadRequestException(ProductsErrorCodes.HostNotFound);

        // set alias
        let alias = createProductDto.alias ?? cleanAlias(createProductDto.name);
        const aliasNumber = (await this.productRepository.countByAlias(host.id!, alias)) || 0;
        if (aliasNumber > 0) alias = `${alias}-${aliasNumber + 1}`;

        // create product
        const product = setProduct({ ...createProductDto, alias, host: { id: host.id!, recordId: host.recordId! } });

        // set post booking steps depending on meeting invitation and location type
        const hostData = {
            name: host.name,
            email: host.email,
            ...(host.phoneNumber && { phoneNumber: host.phoneNumber }),
        };

        if (createProductDto.meetingInvitation)
            product.setMeetingInvitation(hostData, { type: LocationType.ONLINE }, createProductDto.meetingInvitation);
        if (
            createProductDto.productType == ProductType.ONE_TO_ONE_SESSION &&
            createProductDto.location &&
            createProductDto.location.type == LocationType.IN_PERSON
        )
            product.setMeetingInvitation(hostData, createProductDto.location);

        // insert into dynamo db and relational db
        await this.productsDynamoRepository.createProduct(product);
        await this.productRepository.create(
            {
                recordId: product.recordId,
                name: product.name,
                alias: product.alias!,
                hostId: host.id!,
                totalBookings: product.totalBookings,
            },
            product.productStatus,
            product.productType,
        );

        // add s3 related files (thumbnail and listing)
        const mappedProduct = mapProduct(product, this.cfDomain);
        await this.productS3Service.addProductToS3(host.alias ?? '', mappedProduct);

        // Send Telegram notification
        await this.telegramRepository.sendMessage({
            template: TelegramTemplate.PRODUCT_CREATED,
            data: {
                createdAt: new Date().toLocaleString('es-VE', { timeZone: 'America/Caracas' }),
                productName: product.name,
                productAlias: product.alias,
                hostAlias: host.alias,
                hostId: host.recordId,
                productType: product.productType,
            },
        });
        return mappedProduct;
    }
}
