import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProductsErrorCodes } from 'apps/libs/common/constants/error-codes.constant';

import { HostsRepository } from 'apps/libs/database/drizzle/repositories/hosts.repository';
import { BaseProduct } from 'apps/libs/domain/products/product.entity';
import { ProductsDynamoRepository } from 'apps/libs/database/dynamodb/repositories/products.repository';

import { ProductType } from 'apps/libs/common/enums/product-type.enum';
import { ProductStatus } from 'apps/libs/common/enums/product-status.enum';
import { ProductsRepository } from 'apps/libs/database/drizzle/repositories/products.repository';
import { setProduct } from 'apps/libs/domain/products/product-factory';
import { LocationType } from 'apps/libs/common/enums/location-type.enum';
import { ProductS3Service } from 'apps/libs/integrations/s3/product-s3.service';
import { Host } from 'apps/libs/domain/hosts/hosts.entity';

import { UpdateProductDto } from '../../dto/requests/update-product.dto';
import { validateWeeklyAvailability } from '../../utils/validate-availability';
import { processProductDates } from '../../utils/process-product-dates';

import { mapProduct } from '../../utils/map-product';

@Injectable()
export class UpdateProductHandler {
    private readonly cfDomain: string = this.configService.get('CLOUDFRONT_DOMAIN') as string;
    constructor(
        private readonly productsDynamoRepository: ProductsDynamoRepository,
        private readonly productsRepository: ProductsRepository,
        private readonly hostsRepository: HostsRepository,
        private readonly productS3Service: ProductS3Service,
        private readonly configService: ConfigService,
    ) {}

    async execute(
        hostRecordId: string,
        productRecordId: string,
        updateProductDto: UpdateProductDto,
    ): Promise<BaseProduct> {
        const { productData, host, productId } = await this.fetchAndValidateData(hostRecordId, productRecordId);

        this.handleLocationChange(productData, updateProductDto);
        this.preventDeletingBookedDates(productData, updateProductDto);

        updateProductDto.plans = this.preserveTotalBookings(productData.plans, updateProductDto.plans);
        updateProductDto.dates = this.preserveTotalBookings(productData.dates, updateProductDto.dates);
        updateProductDto.discounts = this.preserveTotalBookings(productData.discounts, updateProductDto.discounts);
        updateProductDto.discountCodes = this.preserveTotalBookings(
            productData.discountCodes,
            updateProductDto.discountCodes,
        );

        if (updateProductDto.weeklyAvailability) {
            validateWeeklyAvailability(updateProductDto.weeklyAvailability);
        }

        if (updateProductDto.dates) {
            updateProductDto.dates = processProductDates(updateProductDto.dates);
        }

        if (updateProductDto.alias) {
            await this.validateAlias(host.id!, productData.recordId!, updateProductDto.alias);
        }

        const updatedProduct = setProduct({ ...productData, ...updateProductDto });

        const hostData = {
            name: host.name,
            email: host.email,
            ...(host.phoneNumber && { phoneNumber: host.phoneNumber }),
        };
        this.configureMeetingInvitations(updatedProduct, updateProductDto, hostData, productData);

        await this.productsDynamoRepository.putProduct(hostRecordId, productRecordId, updatedProduct);
        if (updateProductDto.alias || updateProductDto.name) {
            await this.productsRepository.updateProduct(productId, {
                ...(updateProductDto.alias && { alias: updateProductDto.alias }),
                ...(updateProductDto.name && { name: updateProductDto.name }),
            });
        }

        const mappedProduct = mapProduct(updatedProduct, this.cfDomain);
        await this.productS3Service.addProductToS3(host.alias!, mappedProduct);

        return mappedProduct;
    }

    private async fetchAndValidateData(
        hostRecordId: string,
        productRecordId: string,
    ): Promise<{ productData: BaseProduct; host: Host; productId: number }> {
        const productData = await this.productsDynamoRepository.getProduct(hostRecordId, productRecordId);
        if (!productData) throw new BadRequestException(ProductsErrorCodes.ProductNotFound);

        const productId = (await this.productsRepository.findByRecordId(productRecordId))?.id;
        if (!productId) throw new BadRequestException(ProductsErrorCodes.ProductNotFound);

        const host = await this.hostsRepository.findByRecordId(hostRecordId);
        if (!host) throw new BadRequestException(ProductsErrorCodes.HostNotFound);

        return { productData, host, productId };
    }

    private handleLocationChange(productData: BaseProduct, updateProductDto: UpdateProductDto): void {
        if (
            productData.productType === ProductType.ONE_TO_ONE_SESSION &&
            updateProductDto.location &&
            productData.location &&
            updateProductDto.location.type !== productData.location.type
        ) {
            productData.productStatus = ProductStatus.DRAFT;
            productData.postBookingSteps =
                productData.postBookingSteps?.filter((step) => !step.isMeetingInvitation) || [];
            delete productData.meetingInvitation;
        }
    }

    private preventDeletingBookedDates(productData: BaseProduct, updateProductDto: UpdateProductDto): void {
        if (updateProductDto.dates && productData.dates && productData.dates.length > 0) {
            const currentDates = productData.dates;
            const updatedDateIds = updateProductDto.dates?.map((date) => date.recordId) || [];

            for (const currentDate of currentDates) {
                if ((currentDate.totalBookings || 0) > 0 && !updatedDateIds.includes(currentDate.recordId)) {
                    throw new BadRequestException(ProductsErrorCodes.DateCannotBeDeleted);
                }
            }
        }
    }

    private preserveTotalBookings<T extends { recordId?: string; totalBookings?: number }>(
        existingItems: T[] | undefined,
        updatedItems: T[] | undefined,
    ): T[] | undefined {
        if (!updatedItems || !existingItems) {
            return updatedItems;
        }

        return updatedItems.map((item) => {
            const existingItem = existingItems.find((p) => p.recordId === item.recordId);
            if (existingItem && existingItem.totalBookings) {
                return { ...item, totalBookings: existingItem.totalBookings };
            }
            return item;
        });
    }

    private async validateAlias(hostId: number, productId: string, alias: string): Promise<void> {
        const existingProducts = await this.productsRepository.findByAlias(hostId, alias);
        const anotherProductWithSameAlias = existingProducts.find((p) => p.recordId !== productId);
        if (anotherProductWithSameAlias) {
            throw new BadRequestException(ProductsErrorCodes.AliasAlreadyExists);
        }
    }

    private configureMeetingInvitations(
        updatedProduct: BaseProduct,
        updateProductDto: UpdateProductDto,
        hostData: { name: string; email: string; phoneNumber?: { number: string; code: string } },
        productData: BaseProduct,
    ): void {
        if (updateProductDto.meetingInvitation)
            updatedProduct.setMeetingInvitation(
                hostData,
                { type: LocationType.ONLINE },
                updateProductDto.meetingInvitation,
            );
        if (
            productData.productType === ProductType.ONE_TO_ONE_SESSION &&
            updateProductDto.location &&
            updateProductDto.location.type === LocationType.IN_PERSON
        )
            updatedProduct.setMeetingInvitation(hostData, updateProductDto.location);
    }
}
