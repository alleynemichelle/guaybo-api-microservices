import { v4 as uuidv4 } from 'uuid';
import { Expose, plainToClass, Transform, Type } from 'class-transformer';

import {
    IsString,
    IsNotEmpty,
    IsInt,
    IsOptional,
    IsEnum,
    IsTimeZone,
    ValidateNested,
    IsObject,
    IsNumber,
    Min,
    IsArray,
    IsBoolean,
    ArrayNotEmpty,
    IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { convertToUTC, getUTCDate } from 'apps/libs/common/utils/date';
import { DatabaseKeys } from 'apps/libs/common/enums/database-keys.enum';
import { ProductType } from 'apps/libs/common/enums/product-type.enum';
import { ProductStatus } from 'apps/libs/common/enums/product-status.enum';
import { generateId } from 'apps/libs/common/utils/generate-id';
import { DiscountStatus } from 'apps/libs/common/enums/discount-status.enum';
import { BookingFlow } from 'apps/libs/common/enums/booking-flow.enum';
import { ProductStepType } from 'apps/libs/common/enums/product-step-type.enum';
import { BookingPaymentStatus } from 'apps/libs/common/enums/booking-payment-status.enum';
import { cleanAlias } from 'apps/libs/common/utils/text-formatters';
import { ProductsErrorCodes } from 'apps/libs/common/constants/error-codes.constant';
import { Unit } from 'apps/libs/common/enums/unit.enum';
import { ProductDateStatus } from 'apps/libs/common/enums/product-date-status.enum';
import { formatPlatformName, MeetingPlatform } from 'apps/libs/common/enums/meeting-platform.enum';
import { LocationType } from 'apps/libs/common/enums/location-type.enum';

import { Base } from '../common/base.entity';
import { Location } from '../common/location.entity';
import { Multimedia } from '../common/multimedia.entity';
import { Price } from '../common/price.entity';
import { SingleDate } from '../common/single-date.entity';
import { Condition } from '../common/condition.entity';
import { TermsAndConditions } from '../services/terms-and-conditions.entity';
import { FAQ } from '../services/faq.entity';
import { Testimonial } from '../services/testimonial.entity';
import { CustomPageTheme } from '../services/custom-page.entity';
import { Discount } from '../bookings/discount.entity';
import { InstallmentsProgram } from '../bookings/installments-program.entity';
import { Host } from '../hosts/hosts.entity';
import { ValueItem } from '../common/value-item.entity';
import { MeetingInvitation } from '../common/meeting-invite.entity';
import { PhoneNumber } from '../common/phone-number.entity';

export class ProductDate {
    @ApiProperty({
        description: 'The initial date of the product availability in ISO format',
        example: {
            date: '2025-02-12',
            time: '10:00',
        },
    })
    @Type(() => SingleDate)
    @IsNotEmpty()
    initialDate: SingleDate;

    @ApiPropertyOptional({
        description: 'The end date of the product availability in ISO format',
        example: {
            date: '2025-02-15',
            time: '14:00',
        },
    })
    @Type(() => SingleDate)
    @IsOptional()
    endDate?: SingleDate;

    @ApiPropertyOptional({
        description: 'Status of the product date',
        example: ProductDateStatus.DEPENDS_ON_DATE,
    })
    @IsOptional()
    @IsEnum(ProductDateStatus)
    status?: ProductDateStatus;

    @ApiProperty({
        description: 'Unique session date identifier',
        example: '1234567',
    })
    @IsOptional()
    @IsString()
    recordId?: string;

    @ApiPropertyOptional({
        description: 'Total number of bookings for the product date',
        example: 10,
    })
    @IsOptional()
    @IsInt()
    totalBookings?: number;

    @ApiPropertyOptional({
        description: 'Maximum number of bookings for the product date',
        example: 10,
    })
    @IsInt()
    @IsOptional()
    @Min(1)
    maxCapacity?: number;
}

export class ProductPlan {
    @ApiProperty({
        description: 'Id of the plan',
        example: '1234567',
        required: false,
    })
    @IsOptional()
    @IsString()
    recordId?: string;

    @ApiProperty({
        description: 'Name of the plan',
        example: 'Basic Plan',
    })
    @IsString()
    name: string;

    @ApiProperty({
        description: 'Order of the plan',
        example: 1,
        required: false,
    })
    @IsNumber()
    @IsOptional()
    order?: number;

    @ApiProperty({
        description: 'Short description of the plan',
        example: 'Includes access to all basic features',
        required: false,
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        description: 'List of prices associated with the plan',
        type: [Price],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Price)
    price: Price[];

    @ApiPropertyOptional({
        description: 'Minimum price for the plan. Just for display purposes',
        type: Number,
        example: 10,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    fromPrice?: number;

    @ApiProperty({
        description: 'Maximum number of bookings for the plan',
        type: Number,
        required: false,
        example: 10,
    })
    @IsOptional()
    @IsInt()
    @Min(1)
    maxCapacity?: number;

    @ApiPropertyOptional({
        description: 'Total number of bookings for the plan',
        example: 10,
    })
    @IsOptional()
    @IsInt()
    totalBookings?: number;

    @ApiProperty({
        description: 'List of plan tags',
        type: Object,
        required: false,
        example: [
            {
                value: 'Tag 1',
                color: '#FF0000',
                icon: 'icon1',
            },
        ],
    })
    @IsArray()
    @IsOptional()
    tags?: {
        value?: string;
        color?: string;
        icon?: string;
    }[];
}

export class SectionConfig {
    @ApiProperty({ type: Number, description: 'Order of the section', example: 1 })
    @IsNumber()
    @Expose()
    order: number;

    @ApiPropertyOptional({
        type: Object,
        description: 'Additional attributes for the section',
        example: { title: 'Features' },
    })
    @IsObject()
    @IsOptional()
    @Expose()
    attributes?: Record<string, any>;
}

export class TemplateSections {
    @ApiProperty({ type: SectionConfig, description: 'Hero section' })
    @IsOptional()
    @ValidateNested()
    @Type(() => SectionConfig)
    hero?: SectionConfig;

    @ApiProperty({ type: SectionConfig, description: 'Description section' })
    @IsOptional()
    @ValidateNested()
    @Type(() => SectionConfig)
    description?: SectionConfig;

    @ApiProperty({ type: SectionConfig, description: 'Plans section' })
    @IsOptional()
    @ValidateNested()
    @Type(() => SectionConfig)
    plans?: SectionConfig;

    @ApiProperty({ type: SectionConfig, description: 'FAQs section' })
    @IsOptional()
    @ValidateNested()
    @Type(() => SectionConfig)
    faqs?: SectionConfig;

    @ApiProperty({ type: SectionConfig, description: 'Testimonials section' })
    @IsOptional()
    @ValidateNested()
    @Type(() => SectionConfig)
    testimonials?: SectionConfig;
}

export class Template {
    @ApiProperty({ type: String, description: 'Template key' })
    @IsString()
    @IsNotEmpty()
    key: string;

    @ApiPropertyOptional({
        description: 'Theme configuration for the custom page',
        type: CustomPageTheme,
    })
    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => CustomPageTheme)
    theme?: CustomPageTheme;

    @ApiProperty({ type: Object, description: 'Sections configuration' })
    @IsObject()
    @ValidateNested()
    @Type(() => TemplateSections)
    sections: TemplateSections;
}

export class DescriptionSection {
    @ApiProperty({ type: String, description: 'Title section', example: 'About the event' })
    @IsString()
    @IsOptional()
    title?: string;

    @ApiProperty({ type: String, description: "Section's content", example: 'This is the content of the event' })
    @IsString()
    @IsOptional()
    content?: string;
}

export class PostBookingStep {
    @ApiProperty({
        description: 'Id of the plan',
        example: '1234567',
        required: false,
    })
    @IsOptional()
    @IsString()
    recordId?: string;

    @ApiProperty({
        enum: ProductStepType,
        description: 'Post-booking step type',
        example: ProductStepType.WHATSAPP_GROUP,
    })
    @IsEnum(ProductStepType)
    type: ProductStepType;

    @ApiProperty({ description: 'Step title', example: 'WhatsApp group for premium plan' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ description: 'Step description', example: 'Please, join to our community group ' })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiPropertyOptional({
        description: 'Conditions that must be met for the discount to apply',
        type: [Condition],
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Condition)
    conditions?: Condition[];

    @ApiProperty({ description: 'Indica si el paso es obligatorio', default: false })
    @IsBoolean()
    isMandatory: boolean;

    @ApiPropertyOptional({
        description: 'Indicates if the step is a meeting invitation',
        default: false,
    })
    @IsOptional()
    @IsBoolean()
    isMeetingInvitation?: boolean;

    @ApiProperty({
        description: "Custom attributes for host's payment method",
        type: Object,
        required: false,
        example: {
            url: {
                type: 'URL',
                required: true,
                value: 'https://wa.group/example-123',
            },
        },
    })
    @IsObject()
    @IsOptional()
    customAttributes?: {
        [key: string]: {
            icon?: string;
            key?: string;
            label?: string;
            type?: string;
            value: any;
        };
    };
}

export class ProductBookingSettings extends Base {
    @IsEnum(BookingFlow)
    bookingFlow: BookingFlow;

    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    currencies: string[];

    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    requiredData: string[];

    @IsEnum(BookingPaymentStatus)
    @IsOptional()
    defaultPaymentStatus?: BookingPaymentStatus;
}

export class ProductResourceMetrics {
    @ApiProperty({
        description: 'Total number of resources',
        example: 10,
    })
    @IsNumber()
    @IsOptional()
    totalResources?: number;

    @ApiProperty({
        description: 'Total duration of all resources in minutes',
        example: 120,
    })
    @IsNumber()
    @IsOptional()
    totalDuration?: number;

    @ApiProperty({
        description: 'Total size of all resources in bytes',
        example: 1024000,
    })
    @IsNumber()
    @IsOptional()
    totalSize?: number;

    @ApiProperty({
        description: 'Total number of lessons',
        example: 7,
    })
    @IsNumber()
    @IsOptional()
    totalSections?: number;
}

export abstract class BaseProduct extends Base {
    @IsString()
    @IsNotEmpty()
    hostId: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsTimeZone()
    timezone: string;

    @IsBoolean()
    @IsNotEmpty()
    isFree: boolean = false;

    @IsOptional()
    @IsString()
    description?: string;

    @IsNotEmpty()
    @IsEnum(ProductType)
    productType: ProductType;

    @IsNotEmpty()
    @IsEnum(ProductStatus)
    productStatus: ProductStatus;

    @IsNotEmpty()
    @IsBoolean()
    available: boolean;

    @ValidateNested()
    @IsNotEmpty()
    @Type(() => ProductBookingSettings)
    bookingSettings: ProductBookingSettings;

    @ValidateNested()
    @IsNotEmpty()
    @Type(() => Template)
    template: Template;

    @ValidateNested()
    @IsOptional()
    @Type(() => DescriptionSection)
    descriptionSection?: DescriptionSection;

    @ValidateNested()
    @IsOptional()
    @Type(() => Multimedia)
    banner?: Multimedia;

    @ValidateNested()
    @IsOptional()
    @Type(() => Location)
    location?: Location;

    @IsOptional()
    @IsInt()
    totalBookings?: number;

    @IsInt()
    @IsOptional()
    @Min(1)
    maxCapacity?: number;

    @IsNumber()
    @IsOptional()
    @Min(1)
    minCapacity?: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Multimedia)
    mainGallery?: Multimedia[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductDate)
    @IsOptional()
    dates?: ProductDate[];

    @IsOptional()
    @IsDateString()
    mainDate?: string;

    @ValidateNested()
    @Type(() => ValueItem)
    @IsOptional()
    duration?: ValueItem;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductPlan)
    @IsOptional()
    plans?: ProductPlan[];

    @IsArray()
    @ValidateNested({ each: true })
    @IsOptional()
    paymentMethods?: string[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Multimedia)
    gallery?: Multimedia[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FAQ)
    faqs?: FAQ[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Testimonial)
    testimonials?: Testimonial[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Discount)
    @IsOptional()
    discounts?: Discount[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Discount)
    @IsOptional()
    discountCodes?: Discount[];

    @ValidateNested()
    @Type(() => TermsAndConditions)
    termsAndConditions?: TermsAndConditions;

    @ValidateNested()
    @IsOptional()
    @Type(() => InstallmentsProgram)
    installments?: InstallmentsProgram;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PostBookingStep)
    @IsOptional()
    postBookingSteps?: PostBookingStep[];

    @ValidateNested()
    @Type(() => MeetingInvitation)
    @IsOptional()
    meetingInvitation?: MeetingInvitation;

    @ApiPropertyOptional({
        description: 'Metrics for product resources',
        type: ProductResourceMetrics,
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => ProductResourceMetrics)
    resourceMetrics?: ProductResourceMetrics;

    @IsArray()
    @ValidateNested({ each: true })
    @IsOptional()
    coHosts?: {
        hostId: string;
        isMain: string;
    }[];

    constructor(product: Partial<BaseProduct>) {
        super();
        Object.assign(this, product);

        this.recordId = product.recordId ?? uuidv4();
        this.name = product.name?.trim() || '';
        this.alias = cleanAlias(product.alias!);
        this.productStatus = product.productStatus ?? ProductStatus.DRAFT;
        this.createdAt = this.createdAt ?? getUTCDate().toISOString();
        this.recordType = DatabaseKeys.PRODUCT;
        this.timezone = product.timezone ?? 'America/Caracas';

        this.discounts = product.discounts?.map((discount) => ({
            ...discount,
            recordId: discount.recordId ?? generateId(),
            discountStatus: discount.discountStatus ?? DiscountStatus.ACTIVE,
        }));

        this.discountCodes = product.discountCodes?.map((discount) => ({
            ...discount,
            recordId: discount.recordId ?? generateId(),
            discountStatus: discount.discountStatus ?? DiscountStatus.ACTIVE,
        }));

        this.plans = product.plans?.map((plan) => {
            return {
                ...plan,
                recordId: plan.recordId ?? generateId(),
            };
        });

        this.bookingSettings = this.bookingSettings ?? {
            recordId: uuidv4(),
            bookingFlow: BookingFlow.APP_BOOKING,
            currencies: [],
            requiredData: ['email', 'firstName', 'lastName', 'phoneNumber'],
        };

        this.postBookingSteps = product.postBookingSteps?.map((step) => ({
            ...step,
            recordId: step.recordId ?? generateId(),
        }));

        this.isFree = !product.plans?.find((plan) => plan.price.find((price) => price.amount > 0));
    }

    /**
     * Sorts dates chronologically
     * @param a First date to compare
     * @param b Second date to compare
     * @returns Negative if a is before b, positive if a is after b, 0 if equal
     */
    sortDates = (a: ProductDate, b: ProductDate): number => {
        const getZonedDate = (productDate: ProductDate) => {
            const utcDate = convertToUTC(productDate.initialDate).utcDate;

            return utcDate.valueOf();
        };

        return getZonedDate(a) - getZonedDate(b);
    };

    /**
     * Gets the duration of the product in minutes
     * @returns The duration of the product in minutes
     */
    getDurationInMinutes(): number {
        if (this.duration?.unit == Unit.MINUTES) {
            return this.duration.quantity;
        }

        return (this.duration?.quantity || 0) * 60;
    }

    /**
     * Checks if the product is ready to be published
     * @returns {result: boolean, message?: string}
     */
    isReadyToBePublished(paymentOptionsExist: boolean): { result: boolean; message?: string; cause?: string[] } {
        console.log('verifying if product is ready to be published');
        const cause: string[] = [];

        if (!this.isFree && !paymentOptionsExist) cause.push(ProductsErrorCodes.PaymentMethodsRequiredToBePublished);

        if (!this.plans || this.plans?.length == 0) cause.push(ProductsErrorCodes.PlansAreRequiredToBePublished);

        if (cause.length > 0)
            return {
                result: false,
                message: ProductsErrorCodes.ProductIsNotReadyToBePublished,
                cause,
            };

        return { result: true };
    }

    /**
     * Sets the meeting invitation for the product
     * @param meetingInvitation The meeting invitation to set
     */
    setMeetingInvitation(
        host: {
            name: string;
            phoneNumber?: PhoneNumber;
            email: string;
        },
        location: Location,
        meetingInvitation?: MeetingInvitation,
    ) {
        if (meetingInvitation && meetingInvitation.platform === MeetingPlatform.NONE) return;

        const postBookingSteps = this.postBookingSteps || [];
        const isMeetingInvitation = postBookingSteps.find((step) => step.isMeetingInvitation);

        const newMeetingStep = this.createMeetingInvitationStep(host, location, meetingInvitation);

        if (isMeetingInvitation) {
            // Update existing meeting invitation step
            this.postBookingSteps = postBookingSteps.map((step) => {
                if (step.isMeetingInvitation) {
                    return {
                        ...step,
                        ...newMeetingStep,
                        recordId: step.recordId, // Maintain the original recordId
                    };
                }
                return step;
            });
        } else {
            // Add new meeting invitation step
            this.postBookingSteps = [...postBookingSteps, newMeetingStep];
        }
    }

    generateDescription = (
        host: {
            name: string;
            phoneNumber?: PhoneNumber;
            email: string;
        },
        location: Location,
        meetingInvitation?: MeetingInvitation,
    ): string => {
        if (location?.type === LocationType.IN_PERSON) {
            const locationDescription = location.description || 'Ubicación por confirmar';
            const hostName = host?.name || 'el anfitrión';

            return `<b>Sesión:</b> ${this.name} ${this.description || ''}&nbsp;<div><br></div><div><b>Ubicación:</b> ${locationDescription}&nbsp;</div><div><br></div><div>Comunícate con ${hostName} para concretar el encuentro.</div>`;
        }

        if (meetingInvitation && meetingInvitation?.instructions) {
            return `<b>Sesión:</b> ${this.name} ${this.description || ''}&nbsp;<div><br></div><div>${meetingInvitation?.instructions}</div>`;
        }

        const platformName = formatPlatformName(meetingInvitation?.platform);

        return `<b>Sesión:</b> ${this.name} ${this.description || ''}&nbsp;<div><br></div><div><b>Ubicación:</b> Esto es una conferencia web de ${platformName}&nbsp;</div><div></div><div>Puede unirse a la reunión desde el ordenador, tablet o smartphone.</div>`;
    };

    /**
     * Crea un paso de invitación a la reunión
     * @param meetingInvitation La invitación a la reunión
     * @returns Un objeto con la configuración del paso post-reserva
     */
    createMeetingInvitationStep = (
        host: {
            name: string;
            phoneNumber?: PhoneNumber;
            email: string;
        },
        location: Location,
        meetingInvitation?: MeetingInvitation,
    ) => {
        const generateCustomUrl = () => {
            if (location?.type === LocationType.IN_PERSON) {
                const phoneNumber = `${host?.phoneNumber?.code}${host?.phoneNumber?.number}`;

                return {
                    url: {
                        type: 'URL',
                        value: host?.phoneNumber ? `https://wa.me/${phoneNumber}` : `mailto:${host?.email}`,
                    },
                };
            }

            return meetingInvitation?.url
                ? {
                      url: {
                          type: 'URL',
                          value: meetingInvitation.url,
                      },
                  }
                : undefined;
        };

        return {
            recordId: generateId(),
            isMeetingInvitation: true,
            type: (meetingInvitation?.platform as unknown as ProductStepType) || ProductStepType.MEETING_INVITATION,
            title: 'Información para acceder a la reunión',
            description: this.generateDescription(host, location, meetingInvitation),
            isMandatory: false,
            customAttributes: generateCustomUrl(),
        };
    };
}
