import { Customer } from 'apps/libs/domain/users/customer.entity';
import { PhoneNumber } from 'apps/libs/domain/common/phone-number.entity';
import { Status } from 'apps/libs/common/enums/status.enum';
import { DatabaseKeys } from 'apps/libs/common/enums/database-keys.enum';
import { Customer as CustomerType, NewCustomer, CustomerWithDetails } from '../types';
import { BaseData } from 'apps/libs/domain/common/base.entity';

export class CustomerMapper {
    static toDomain(row: CustomerWithDetails): Customer {
        // Map phone number from tags if available
        let phoneNumber: PhoneNumber | undefined;
        if (row.tags && typeof row.tags === 'object' && 'phoneNumber' in row.tags) {
            const phoneData = (row.tags as any).phoneNumber;
            if (phoneData && phoneData.code && phoneData.number) {
                phoneNumber = new PhoneNumber();
                phoneNumber.code = phoneData.code;
                phoneNumber.number = phoneData.number;
            }
        }

        // Map host data
        const hostData: BaseData = {
            id: row.host?.id || 0,
            recordId: row.host?.recordId || '',
        };

        // Map user data
        const userData: BaseData = {
            id: row.user?.id || 0,
            recordId: row.user?.recordId || '',
        };

        const customer = new Customer({
            id: row.id,
            recordId: row.recordId,
            host: hostData,
            user: userData,
            email: row.user?.email || '',
            firstName: row.user?.firstName || undefined,
            lastName: row.user?.lastName || undefined,
            fullName: row.user?.fullName || undefined,
            phoneNumber: phoneNumber,
            instagramAccount: row.user?.instagramAccount || undefined,
            totalBookings: row.totalBookings || 0,
        });

        // Set additional fields from the entity
        customer.recordStatus = Status.ACTIVE; // Default status
        customer.recordType = DatabaseKeys.CUSTOMER;
        customer.createdAt = row.createdAt?.toISOString();
        customer.updatedAt = row.updatedAt?.toISOString();

        return customer;
    }

    static toPersistence(entity: Customer, hostId: number, userId: number): NewCustomer {
        // Prepare tags object with phone number if available
        const tags: any = {};
        if (entity.phoneNumber) {
            tags.phoneNumber = {
                code: entity.phoneNumber.code,
                number: entity.phoneNumber.number,
            };
        }

        return {
            recordId: entity.recordId,
            hostId: hostId,
            userId: userId,
            totalBookings: entity.totalBookings || 0,
            tags: Object.keys(tags).length > 0 ? tags : undefined,
        };
    }
}
