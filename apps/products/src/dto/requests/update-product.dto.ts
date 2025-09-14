import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsTimeZone, IsString, ValidateNested, IsOptional, IsInt, Min } from 'class-validator';

import {
    DescriptionSection,
    PostBookingStep,
    ProductDate,
    ProductPlan,
    Template,
} from 'apps/libs/entities/products/product.entity';
import { Multimedia } from 'apps/libs/entities/common/multimedia.entity';
import { FAQ } from 'apps/libs/entities/services/faq.entity';
import { Discount } from 'apps/libs/entities/bookings/discount.entity';
import { TermsAndConditions } from 'apps/libs/entities/services/terms-and-conditions.entity';
import { Location } from 'apps/libs/entities/common/location.entity';
import { Testimonial } from 'apps/libs/entities/services/testimonial.entity';
import { InstallmentsProgram } from 'apps/libs/entities/bookings/installments-program.entity';
import { SessionAvailabilityType } from 'apps/libs/common/enums/session-availability-type.enum';
import { WeeklyAvailability } from 'apps/libs/entities/products/weekly-availability.entity';
import { MeetingInvitation } from 'apps/libs/entities/common/meeting-invite.entity';
import { ProductDateStatus } from 'apps/libs/common/enums/product-date-status.enum';
import { ValueItem } from 'apps/libs/entities/common/value-item.entity';

export class UpdateProductDto {
    @ApiPropertyOptional({
        description: 'Timezone of the host.',
        example: 'America/Caracas',
        type: String,
        required: false,
    })
    @IsOptional()
    @IsTimeZone()
    timezone?: string;

    @ApiPropertyOptional({
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
    @IsOptional()
    @ValidateNested()
    @Type(() => Template)
    template?: Template;

    @ApiPropertyOptional({
        description: 'Product Alias',
        example: '2025-digital-challenge',
    })
    @IsOptional()
    @IsString()
    alias?: string;

    @ApiPropertyOptional({
        description: 'Product name',
        example: '2025 Digital Challenge',
    })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({
        type: String,
        description: 'Product description',
        example: 'Transform your digital presence in 21 days',
    })
    @IsString()
    @IsOptional()
    description?: string;

    // @ApiPropertyOptional({
    //     type: [String],
    //     description: 'Payment methods IDs',
    //     example: ['123d7b3f-1b3b-4b3b-8b3b-3b3b3b3b3b3b', '456789-1b3b-4b3b-8b3b-3b3b3b3b3b3b'],
    // })
    // @IsArray()
    // @IsOptional()
    // paymentMethods?: string[];

    @ApiPropertyOptional({
        type: [ProductDate],
        description: 'Available dates for the product',
        example: [
            {
                status: ProductDateStatus.DEPENDS_ON_DATE,
                initialDate: {
                    date: '2025-02-12',
                    time: '10:00',
                },
                endDate: {
                    date: '2025-02-15',
                    time: '14:00',
                },
            },
        ],
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
        type: Number,
        description: 'Duration of the product in minutes',
        example: 60,
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => ValueItem)
    duration?: ValueItem;

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
        type: InstallmentsProgram,
        description: 'Installments program of this event. Default: not active',
    })
    @ValidateNested()
    @IsOptional()
    @Type(() => InstallmentsProgram)
    installments?: InstallmentsProgram;

    @ApiPropertyOptional({
        type: [PostBookingStep],
        description: 'Steps that the user has to follow after creating a booking. ',
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PostBookingStep)
    @IsOptional()
    postBookingSteps?: PostBookingStep[];

    @ApiPropertyOptional({
        type: MeetingInvitation,
        description: 'Meeting invitation details for online sessions',
    })
    @ValidateNested()
    @IsOptional()
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
