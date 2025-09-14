import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UsersDynamoRepository } from 'apps/libs/repositories/users/users-dynamo.repository';

import { ResponseDto } from '../response.entity';

@Injectable()
export class HostOwnerGuard implements CanActivate {
    constructor(private readonly usersRepository: UsersDynamoRepository) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const userId = request.user?.id;
        const hostId = request.params?.hostId;
        console.log(`User ${userId} trying to access host ${hostId}`);

        if (!userId || !hostId) {
            const response = new ResponseDto('error', 403, 'UnauthorizedAccess', {});
            throw new ForbiddenException(response);
        }

        const userHost = await this.usersRepository.getUserHost(userId, hostId);
        if (!userHost) {
            const response = new ResponseDto('error', 403, 'UnauthorizedAccess', {});
            throw new ForbiddenException(response);
        }

        return true;
    }
}
