import { Host } from 'apps/libs/domain/hosts/hosts.entity';
import { PhoneNumber } from 'apps/libs/domain/common/phone-number.entity';
import { Location } from 'apps/libs/domain/common/location.entity';

import { Multimedia } from 'apps/libs/domain/common/multimedia.entity';
import { BillingPlan } from 'apps/libs/domain/billings/billing-plan.entity';
import { Discount } from 'apps/libs/domain/bookings/discount.entity';
import { Status } from 'apps/libs/common/enums/status.enum';
import { KYCStatus } from 'apps/libs/common/enums/kyc-status.enum';
import { DatabaseKeys } from 'apps/libs/common/enums/database-keys.enum';
import { Host as HostType, HostWithDetails, HostWithLogoAndStatus, NewHost } from '../types';
import { MultimediaType } from 'apps/libs/common/enums/multimedia-type.enum';
import { MultimediaSource } from 'apps/libs/common/enums/multimedia-source.enum';
import { AmountType } from 'apps/libs/common/enums/amount-type.enum';
import { CommissionPayer } from 'apps/libs/common/enums/commission-payer.enum';
import { BillingType } from 'apps/libs/common/enums/billing-model.enum';
import { DiscountScope } from 'apps/libs/common/enums/discount-scope.enum';
import { Unit } from 'apps/libs/common/enums/unit.enum';

export class HostMapper {
    static toDomain(row: HostType | HostWithDetails | HostWithLogoAndStatus): Host {
        // Map phone number if both code and number exist
        let phoneNumber: PhoneNumber | undefined;
        if (row.phoneCode && row.phoneNumber) {
            phoneNumber = new PhoneNumber();
            phoneNumber.code = row.phoneCode;
            phoneNumber.number = row.phoneNumber;
        }

        // Map location if available
        let location: Location | undefined;
        if (row.tags && typeof row.tags === 'object' && 'location' in row.tags) {
            location = row.tags.location as Location;
        }

        // Map multimedia/logo
        let logo: Multimedia | undefined;
        if ('multimedia' in row && row.multimedia && row.multimedia.length > 0) {
            const logoData = row.multimedia[0];
            logo = {
                id: logoData.id,
                recordId: logoData.recordId,
                type: logoData.type as MultimediaType,
                source: logoData.source as MultimediaSource,
                path: logoData.path as string,
                filename: logoData.filename as string,
                description: logoData.description as string,
                order: logoData.orderIndex || 1,
            };
        }

        // Map billing plan if available
        let billingPlan: BillingPlan | undefined;
        if ('billingPlan' in row && row.billingPlan) {
            // Map discounts from hostBillingDiscounts
            const discounts: Discount[] = [];
            if ('hostBillingDiscounts' in row && row.hostBillingDiscounts) {
                discounts.push(
                    ...row.hostBillingDiscounts.map((discount) => {
                        const discountEntity = new Discount();
                        discountEntity.recordId = discount.discount?.recordId || '';
                        discountEntity.name = discount.discount?.name || '';
                        discountEntity.description = discount.discount?.description || '';
                        discountEntity.amount = discount.discount?.amount || 0;
                        discountEntity.type = (discount.discount?.type as AmountType) || AmountType.FIXED;
                        discountEntity.scope = (discount.discount?.scope as DiscountScope) || DiscountScope.TOTAL;
                        discountEntity.validFrom = discount.validFrom?.toISOString() || '';
                        discountEntity.validUntil = discount.validUntil?.toISOString() || '';
                        discountEntity.duration = {
                            unit: (discount.discount?.durationUnit as Unit) || Unit.DD,
                            quantity: discount.discount?.durationQuantity || 0,
                        };
                        discountEntity.code = discount.discount?.code || '';
                        return discountEntity;
                    }),
                );
            }

            billingPlan = new BillingPlan({
                id: row.billingPlan.id,
                recordId: row.billingPlan.recordId,
                key: row.billingPlan.key,
                billingType: BillingType.DEFAULT, // Default value, could be enhanced based on business logic
                description: row.billingPlan.description!,
                features: row.billingPlan.features as any,
                commissionPayer: row.commissionPayer as CommissionPayer,
                discounts: discounts.length > 0 ? discounts : undefined,
                breakdown:
                    row.billingPlan.planBreakdowns?.map((pb) => ({
                        key: pb.key,
                        type: pb.type as AmountType,
                        amount: pb.amount!,
                    })) || [],
            });
        }

        return new Host({
            id: row.id,
            recordId: row.recordId,
            alias: row.alias,
            collectionId: row.collectionId ?? undefined,
            phoneNumber: phoneNumber,
            email: row.email,
            name: row.name,
            description: row.description ?? undefined,
            logo: logo,
            timezone: row.timezone ?? undefined,
            verified: row.verified ?? undefined,
            location: location,
            rating: row.rating ? parseFloat(row.rating as any) : undefined,
            reviews: row.reviews ?? undefined,
            yearsOfExperience: row.yearsExperience ?? undefined,
            multimedia:
                'multimedia' in row
                    ? row.multimedia?.map((m) => ({
                          id: m.id,
                          recordId: m.recordId,
                          type: m.type as MultimediaType,
                          source: m.source as MultimediaSource,
                          path: m.path as string,
                          filename: m.filename as string,
                          description: m.description as string,
                          order: m.orderIndex || 1,
                      }))
                    : undefined,
            billingPlan: billingPlan,
            verificationStatus: 'verificationStatus' in row ? (row.verificationStatus?.name as KYCStatus) : undefined,
            recordStatus: 'status' in row ? (row.status?.name as Status) : Status.ACTIVE,
            recordType: DatabaseKeys.HOST,
            createdAt: row.createdAt?.toISOString(),
            updatedAt: row.updatedAt?.toISOString(),
        });
    }

    static toPersistence(
        entity: Host,
        billingPlanId: number,
        statusId: number,
        verificationStatusId?: number,
    ): NewHost {
        return {
            recordId: entity.recordId,
            billingPlanId: billingPlanId,
            commissionPayer: 'HOST', // Default value
            name: entity.name,
            alias: entity.alias as string,
            email: entity.email,
            collectionId: entity.collectionId,
            description: entity.description,
            phoneCode: entity.phoneNumber?.code,
            phoneNumber: entity.phoneNumber?.number,
            timezone: entity.timezone,
            verified: entity.verified,
            rating: entity.rating?.toString(),
            reviews: entity.reviews,
            yearsExperience: entity.yearsOfExperience,
            tags: entity.location ? { location: entity.location } : undefined,
            statusId: statusId,
            verificationStatusId: verificationStatusId,
        };
    }
}
