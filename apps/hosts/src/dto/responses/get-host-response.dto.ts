import { ApiProperty } from '@nestjs/swagger';
import { ResponseDto } from 'apps/libs/common/api/response.entity';
import { DiscountStatus } from 'apps/libs/common/enums/discount-status.enum';
import { ValueItem } from 'apps/libs/domain/common/value-item.entity';

class PhoneNumberDto {
    @ApiProperty({ example: '4141221422' })
    number: string;

    @ApiProperty({ example: '58' })
    code: string;
}

class TagDto {
    @ApiProperty({ example: 'happy' })
    value: string;

    @ApiProperty({ example: 'happy' })
    key: string;
}

class LogoDto {
    @ApiProperty({ example: 'a64e8b98-cb86-4be0-b9a3-28fa7204374e' })
    recordId: string;

    @ApiProperty({
        example: 'https://cdn-dev.guaybo.com/public/hosts/d83c552c-e503-4c72-b41c-d0d6b4f7e949/images.png',
    })
    path: string;

    @ApiProperty({ example: 'APP' })
    source: string;

    @ApiProperty({ example: 'IMAGE' })
    type: string;

    @ApiProperty({ example: 1 })
    order: number;
}

class BillingPlanDiscountDto {
    @ApiProperty({ example: 'a3085f47-4fc6-460c-933b-1037828dcca7' })
    recordId: string;

    @ApiProperty({ type: ValueItem })
    duration?: ValueItem;

    @ApiProperty({ example: 50 })
    amount: number;

    @ApiProperty({ example: 'ACTIVE' })
    discountStatus: DiscountStatus;

    @ApiProperty({ example: 'TOTAL' })
    scope: string;

    @ApiProperty({ example: '50% de descuento en comisiones por el primer mes' })
    description?: string;

    @ApiProperty({ example: '2025-07-12T21:23:24.120Z' })
    validUntil?: string;

    @ApiProperty({ example: '2025-06-12T21:23:24.120Z' })
    validFrom?: string;

    @ApiProperty({ example: 'PERCENTAGE' })
    type: string;

    @ApiProperty({ example: 'QUIEROVENDER', nullable: true })
    code?: string;
}

class BillingPlanBreakdownDto {
    @ApiProperty({ example: 'PERCENTAGE' })
    type: string;

    @ApiProperty({ example: 7.9 })
    amount: number;

    @ApiProperty({ example: 'PLAN_PERCENTAGE_COMMISSION' })
    key: string;
}

class BillingPlanResponseDto {
    @ApiProperty({ example: 'd1221a11-307b-4c1b-b5a5-72d1bed61f0a' })
    recordId: string;

    @ApiProperty({
        type: [String],
        example: ['7.9% de comisión por reserva', '$0.44 fijos por reserva'],
    })
    features: any;

    @ApiProperty({ type: [BillingPlanDiscountDto] })
    discounts: BillingPlanDiscountDto[];

    @ApiProperty({ type: [BillingPlanBreakdownDto] })
    breakdown: BillingPlanBreakdownDto[];

    @ApiProperty({ example: 'BASIC' })
    key: string;

    @ApiProperty({ example: 'HOST' })
    commissionPayer: string;
}

export class HostDetailsDto {
    @ApiProperty({ example: 'd83c552c-e503-4c72-b41c-d0d6b4f7e949' })
    recordId: string;

    @ApiProperty({ example: 'alleynemichelle123+test@gmail.com' })
    email: string;

    @ApiProperty({ example: '76bf2310-eef1-4e29-9938-693aa29695e5' })
    collectionId: string;

    @ApiProperty({ example: 'michi-guayabo' })
    alias: string;

    @ApiProperty({ example: 'michi guayabo' })
    name: string;

    @ApiProperty({ example: 'America/Caracas' })
    timezone: string;

    @ApiProperty({ type: PhoneNumberDto, required: false })
    phoneNumber?: PhoneNumberDto;

    @ApiProperty({ example: 'Esta es una descripcion' })
    description: string;

    @ApiProperty({ type: [TagDto], required: false })
    tags?: any;

    @ApiProperty({ type: LogoDto, required: false })
    logo?: LogoDto;

    @ApiProperty({ type: BillingPlanResponseDto, required: false })
    billingPlan?: BillingPlanResponseDto;

    @ApiProperty({ example: 'APPROVED', required: false })
    verificationStatus?: string;

    @ApiProperty({ example: 'ACTIVE', required: false })
    status?: string;
}

export class GetHostResponseDto extends ResponseDto {
    @ApiProperty({
        type: HostDetailsDto,
        example: {
            recordId: 'd83c552c-e503-4c72-b41c-d0d6b4f7e949',
            email: 'alleynemichelle123+test@gmail.com',
            collectionId: '76bf2310-eef1-4e29-9938-693aa29695e5',
            alias: 'michi-guayabo',
            name: 'michi guayabo',
            timezone: 'America/Caracas',
            phoneNumber: {
                number: '4141221422',
                code: '58',
            },
            description: 'Esta es una descripcion',
            tags: [
                {
                    value: 'happy',
                    key: 'happy',
                },
            ],
            logo: {
                recordId: 'a64e8b98-cb86-4be0-b9a3-28fa7204374e',
                path: 'https://cdn-dev.guaybo.com/public/hosts/d83c552c-e503-4c72-b41c-d0d6b4f7e949/images.png',
                source: 'APP',
                type: 'IMAGE',
                order: 1,
            },
            billingPlan: {
                recordId: 'd1221a11-307b-4c1b-b5a5-72d1bed61f0a',
                createdAt: '2025-06-12T21:23:24.120Z',
                features: ['7.9% de comisión por reserva', '$0.44 fijos por reserva'],
                discounts: [
                    {
                        recordId: 'a3085f47-4fc6-460c-933b-1037828dcca7',
                        duration: {
                            unit: 'MM',
                            quantity: '1',
                        },
                        amount: 50,
                        discountStatus: 'ACTIVE',
                        scope: 'TOTAL',
                        description: '50% de descuento en comisiones por el primer mes',
                        validUntil: '2025-07-12T21:23:24.120Z',
                        validFrom: '2025-06-12T21:23:24.120Z',
                        type: 'PERCENTAGE',
                    },
                ],
                breakdown: [
                    {
                        type: 'PERCENTAGE',
                        amount: 7.9,
                        key: 'PLAN_PERCENTAGE_COMMISSION',
                    },
                    {
                        type: 'FIXED',
                        amount: 0.44,
                        key: 'PLAN_FIXED_COMMISSION',
                    },
                ],
                key: 'BASIC',
                commissionPayer: 'HOST',
                updatedAt: '2025-06-12T21:23:24.120Z',
            },
            verificationStatus: 'APPROVED',
        },
    })
    data: HostDetailsDto;
}
