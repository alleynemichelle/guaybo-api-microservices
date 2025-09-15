import { uuid } from 'uuidv4';

import { Injectable, Inject } from '@nestjs/common';
import { Customer } from 'apps/libs/entities/users/customer.entity';
import { User } from 'apps/libs/entities/users/user.entity';
import { DatabaseKeys } from 'apps/libs/common/enums/database-keys.enum';
import { IUsersRepository } from 'apps/libs/repositories/users/users-repository.interface';
import { Status } from 'apps/libs/common/enums/status.enum';

/**
 * Service for managing user and customer operations
 */
@Injectable()
export class UserManagementService {
    constructor(@Inject('UsersRepository') private readonly usersRepository: IUsersRepository) {}

    /**
     * Prepares user data for booking creation
     * Handles both user and customer creation/retrieval
     */
    async prepareUser(hostId: string, data: Partial<Customer>): Promise<Customer> {
        const email = data.email as string;

        // 1. Fetch or create the user
        const { userId, isRegistered } = await this.getOrCreateUser(email, data, hostId);

        // 2. Fetch or generate the customer ID
        const customerId = await this.getOrCreateCustomerId(hostId, email);

        // 3. Create and return the customer with registration status
        const customer = new Customer({ ...data, email, hostId, userId, recordId: customerId });

        // Add registration status as a property (not persisted, just for this session)
        (customer as any).isRegistered = isRegistered;

        return customer;
    }

    /**
     * Gets existing user or creates a new one
     * Returns both userId and registration status
     */
    private async getOrCreateUser(
        email: string,
        userData: Partial<Customer>,
        hostId: string,
    ): Promise<{ userId: string; isRegistered: boolean }> {
        let userId = await this.usersRepository.getUserId(email, DatabaseKeys.USER);
        let isRegistered = false;

        if (!userId) {
            // User doesn't exist, create new unregistered user
            const { hostId: _, ...userDataWithoutHostId } = userData;
            const user = new User({
                ...userDataWithoutHostId,
                hostId,
                registered: false,
                status: Status.ACTIVE,
            });
            userId = user.recordId;
            await this.usersRepository.insertUser(user);
            isRegistered = false;
        } else {
            // User exists, check if registered
            const existingUser = await this.usersRepository.getUser(userId);
            isRegistered = existingUser?.registered ?? false;

            if (
                (!existingUser?.phoneNumber && userData.phoneNumber) ||
                (!existingUser?.lastName && userData.lastName)
            ) {
                await this.usersRepository.updateUser(userId, {
                    phoneNumber: userData.phoneNumber,
                    lastName: userData.lastName,
                });
            }
        }

        return { userId, isRegistered };
    }

    /**
     * Gets existing customer ID or generates a new one
     */
    private async getOrCreateCustomerId(hostId: string, email: string): Promise<string> {
        const existingCustomer = await this.usersRepository.getCustomerByEmail(hostId, email, true);
        return existingCustomer?.recordId || uuid();
    }

    /**
     * Validates user data before booking creation
     */
    async validateUserData(userData: Partial<Customer>): Promise<void> {
        if (!userData.email) {
            throw new Error('Email is required');
        }
    }

    /**
     * Gets existing customer by email
     */
    async getCustomerByEmail(hostId: string, email: string): Promise<Customer | null> {
        return await this.usersRepository.getCustomerByEmail(hostId, email, true);
    }

    /**
     * Creates a new user
     */
    async createUser(userData: Partial<User>): Promise<User> {
        const user = new User(userData);
        await this.usersRepository.insertUser(user);
        return user;
    }

    /**
     * Creates a new customer
     */
    async createCustomer(customerData: Partial<Customer>): Promise<Customer> {
        const customer = new Customer(customerData);
        return customer;
    }
}
