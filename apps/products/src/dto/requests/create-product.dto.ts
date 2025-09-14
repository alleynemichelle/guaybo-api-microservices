import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    Min,
    IsArray,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsTimeZone,
    ValidateNested,
} from 'class-validator';

import { ProductType } from 'apps/libs/common/enums/product-type.enum';
import { DescriptionSection, ProductDate, ProductPlan, Template } from 'apps/libs/entities/products/product.entity';
import { Multimedia } from 'apps/libs/entities/common/multimedia.entity';
import { FAQ } from 'apps/libs/entities/services/faq.entity';
import { Discount } from 'apps/libs/entities/bookings/discount.entity';
import { TermsAndConditions } from 'apps/libs/entities/services/terms-and-conditions.entity';
import { Location } from 'apps/libs/entities/common/location.entity';
import { Testimonial } from 'apps/libs/entities/services/testimonial.entity';
import { SessionAvailabilityType } from 'apps/libs/common/enums/session-availability-type.enum';
import { ValueItem } from 'apps/libs/entities/common/value-item.entity';
import { WeeklyAvailability } from 'apps/libs/entities/products/weekly-availability.entity';
import { MeetingInvitation } from 'apps/libs/entities/common/meeting-invite.entity';

export class CreateProductDto {
    @ApiProperty({
        description: 'Timezone of the host.',
        example: 'America/Caracas',
        type: String,
        required: true,
    })
    @IsNotEmpty()
    @IsTimeZone()
    timezone: string;

    @ApiProperty({
        description: 'Host ID',
        example: '5f9d7b3f-1b3b-4b3b-8b3b-3b3b3b3b3b3b',
    })
    @IsString()
    @IsNotEmpty()
    hostId: string;

    @ApiProperty({
        enum: ProductType,
        description: 'Type of product',
        example: ProductType.EVENT,
    })
    @IsEnum(ProductType)
    @IsNotEmpty()
    productType: ProductType;

    @ApiProperty({
        description: 'Event template',
        example: {
            key: 'EVENT',
            theme: {
                primary: '#4F46E5',
            },
            sections: {
                hero: {
                    order: 1,
                },
                mainDescription: {
                    order: 2,
                },
                plans: {
                    order: 3,
                },
                custom1: {
                    order: 4,
                    title: 'sobre mi',
                },
            },
        },
    })
    @ValidateNested()
    @IsNotEmpty()
    @Type(() => Template)
    template: Template;

    @ApiPropertyOptional({
        description: 'Product Alias',
        example: '2025-digital-challenge',
    })
    @IsOptional()
    @IsString()
    alias?: string;

    @ApiProperty({
        description: 'Product name',
        example: '2025 Digital Challenge',
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional({
        type: [ProductDate],
        description: 'Available dates for the product',
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductDate)
    @IsOptional()
    dates?: ProductDate[];

    @ApiPropertyOptional({
        enum: SessionAvailabilityType,
        description: 'Type of availability for sessions',
        example: SessionAvailabilityType.DEFINED_RANGE,
    })
    @IsEnum(SessionAvailabilityType)
    @IsOptional()
    availabilityType?: SessionAvailabilityType;

    @ApiPropertyOptional({
        type: WeeklyAvailability,
        description: 'Weekly availability for sessions',
        example: {
            monday: [
                {
                    start: '09:00',
                    end: '12:00',
                },
            ],
            tuesday: [
                {
                    start: '09:00',
                    end: '11:00',
                },
            ],
        },
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => WeeklyAvailability)
    weeklyAvailability?: WeeklyAvailability;

    @ApiPropertyOptional({
        type: String,
        description: 'Product description',
        example: 'Transform your digital presence in 21 days',
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({
        type: [String],
        description: 'Payment methods IDs',
        example: ['123d7b3f-1b3b-4b3b-8b3b-3b3b3b3b3b3b', '456789-1b3b-4b3b-8b3b-3b3b3b3b3b3b'],
    })
    @IsArray()
    @IsOptional()
    paymentMethods?: string[];

    @ApiPropertyOptional({
        type: Location,
        description: 'Product location details',
    })
    @ValidateNested()
    @Type(() => Location)
    @IsOptional()
    location?: Location;

    @ApiPropertyOptional({
        type: Multimedia,
        description: 'Main page banner',
    })
    @ValidateNested()
    @IsOptional()
    @Type(() => Multimedia)
    banner?: Multimedia;

    @ApiPropertyOptional({
        type: [Multimedia],
        description: 'Header gallery images/videos',
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Multimedia)
    @IsOptional()
    mainGallery?: Multimedia[];

    @ApiPropertyOptional({
        type: [Multimedia],
        description: 'Product gallery section data',
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Multimedia)
    gallery?: Multimedia[];

    @ApiPropertyOptional({
        type: [ProductPlan],
        description: 'Available plans for the product',
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductPlan)
    @IsOptional()
    plans?: ProductPlan[];

    @ApiPropertyOptional({
        type: [Testimonial],
        description: 'Testimonials of this product',
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Testimonial)
    testimonials?: Testimonial[];

    @ApiPropertyOptional({
        type: [DescriptionSection],
        description: 'Description section',
    })
    @ValidateNested()
    @IsOptional()
    @Type(() => DescriptionSection)
    descriptionSection?: DescriptionSection;

    @ApiPropertyOptional({
        type: [FAQ],
        description: 'Frequently asked questions',
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FAQ)
    @IsOptional()
    faqs?: FAQ[];

    @ApiPropertyOptional({
        type: [Discount],
        description: 'Available discounts',
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Discount)
    @IsOptional()
    discounts?: Discount[];

    @ApiPropertyOptional({
        type: [Discount],
        description: 'Available discounts codes.',
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Discount)
    @IsOptional()
    discountCodes?: Discount[];

    @ApiPropertyOptional({
        type: TermsAndConditions,
        description: 'Product terms and conditions',
    })
    @ValidateNested()
    @Type(() => TermsAndConditions)
    @IsOptional()
    termsAndConditions?: TermsAndConditions;

    @ApiPropertyOptional({
        type: ValueItem,
        description: 'Duration of the product',
        example: { value: 60, unit: 'MINUTES' },
    })
    @ValidateNested()
    @Type(() => ValueItem)
    @IsOptional()
    duration?: ValueItem;

    @ApiPropertyOptional({
        description: 'Meeting invitation details for online sessions',
        required: false,
        type: MeetingInvitation,
    })
    @ValidateNested()
    @Type(() => MeetingInvitation)
    meetingInvitation?: MeetingInvitation;

    @ApiPropertyOptional({
        type: Number,
        description: 'Maximum number of bookings for the product',
        example: 10,
    })
    @IsOptional()
    @IsInt()
    @Min(1)
    maxCapacity?: number;
}
