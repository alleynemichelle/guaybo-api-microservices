import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from 'apps/libs/domain/users/user.entity';
import { UsersRepository } from 'apps/libs/database/drizzle/repositories/users.repository';
import { UsersErrorCodes } from 'apps/libs/common/constants/error-codes.constant';
import { UpdateUserDto } from '../dto/requests/update-user.dto';
import { UpdateUserResponseDto } from '../dto/responses/update-user.response.dto';

@Injectable()
export class UpdateUserHandler {
    constructor(private readonly usersRepository: UsersRepository) {}

    async execute(userRecordId: string, updateUserDto: UpdateUserDto): Promise<UpdateUserResponseDto> {
        const user = await this.usersRepository.findByRecordId(userRecordId);
        if (!user) throw new BadRequestException(UsersErrorCodes.UserNotFoundException);

        const updatedUser = await this.usersRepository.updateById(user.id!, {
            ...updateUserDto,
            phoneNumber: updateUserDto.phoneNumber?.number,
            phoneCode: updateUserDto.phoneNumber?.code,
        });

        return this.mapUserToResponseDto(updatedUser as User);
    }

    private mapUserToResponseDto(user: User): UpdateUserResponseDto {
        return {
            recordId: user.recordId!,
            firstName: user.firstName!,
            lastName: user.lastName!,
            fullName: user.fullName!,
            email: user.email,
            timezone: user.timezone!,
            defaultLanguage: user.defaultLanguage!,
            registered: user.registered!,
            federated: user.federated!,
            verifiedEmail: user.verifiedEmail!,
            createdAt: user.createdAt!,
            lastAccess: user.lastAccess!,
        };
    }
}
