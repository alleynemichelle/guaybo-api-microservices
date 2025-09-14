import { Inject, Injectable } from '@nestjs/common';
import { UsersRepository } from 'apps/libs/database/drizzle/repositories/users.repository';
import { CreateUserProfileDto } from 'apps/users/src/dto/requests/create-user-profile.dto';
import { User } from 'apps/libs/domain/users/user.entity';
import { Status } from 'apps/libs/common/enums/status.enum';
import { Language } from 'apps/libs/common/enums/language.enum';

import { StatusLookup } from 'apps/libs/database/drizzle/lookups/status.lookup';
import { IUsersAuth } from '../interfaces/users-auth.interface';

@Injectable()
export class CreateUserProfileHandler {
    constructor(
        @Inject('AuthService') private readonly authService: IUsersAuth,
        private readonly usersRepository: UsersRepository,
        private readonly statusLookup: StatusLookup,
    ) {}

    async execute(
        sub: string,
        email: string,
        createUserProfileDto: CreateUserProfileDto,
    ): Promise<{
        recordId: string;
        firstName: string;
        lastName: string;
        fullName: string;
        email: string;
        timezone: string;
        defaultLanguage: Language;
        registered: boolean;
        federated: boolean;
        verifiedEmail: boolean;
    }> {
        const user = new User({ ...createUserProfileDto, email, registered: true });

        let userEntity: User | null = await this.usersRepository.findByEmail(email);
        let userRecordId = userEntity?.recordId;

        if (!userEntity) {
            const statusId = await this.statusLookup.toId(Status.ACTIVE);
            userEntity = await this.usersRepository.create({
                email,
                firstName: user.firstName,
                lastName: user.lastName,
                fullName: user.fullName,
                timezone: createUserProfileDto.timezone,
                federated: user.federated,
                phoneCode: user.phoneNumber?.code,
                phoneNumber: user.phoneNumber?.number,
                registered: true,
                statusId,
            });
            userRecordId = userEntity.recordId;
        } else {
            await this.usersRepository.updateById(userEntity.id!, {
                firstName: user.firstName,
                lastName: user.lastName,
                fullName: user.fullName,
                timezone: user.timezone,
                federated: user.federated,
                phoneCode: user.phoneNumber?.code,
                phoneNumber: user.phoneNumber?.number,
                registered: true,
            });
        }

        // add custom attributes to user
        console.log('adding custom attributes to user', sub);
        await this.authService.addUserCustomAttributes(sub, [
            { Name: 'custom:userId', Value: userRecordId },
            { Name: 'custom:status', Value: Status.ACTIVE },
            { Name: 'custom:defaultLanguage', Value: Language.ES },
        ]);

        return {
            recordId: userEntity.recordId!,
            firstName: userEntity.firstName!,
            lastName: userEntity.lastName!,
            fullName: userEntity.fullName!,
            email: userEntity.email,
            timezone: userEntity.timezone!,
            defaultLanguage: userEntity.defaultLanguage! as Language,
            registered: userEntity.registered!,
            federated: userEntity.federated!,
            verifiedEmail: userEntity.verifiedEmail!,
        };
    }
}
