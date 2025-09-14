import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

import { ResponseDto } from '../response.entity';
import { RequestUser } from './jwt-auth-v2.guard';

@Injectable()
export class HostOwnerGuard implements CanActivate {
    constructor() {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user: RequestUser = request.user;
        const userId = user.id;
        const hostId = request.params?.hostId;
        const userHost = user.hosts?.find((host) => host.recordId === hostId);
        console.log(`User ${userId} trying to access host ${hostId}`);

        if (!userId || !hostId || !userHost) {
            const response = new ResponseDto('error', 403, 'UnauthorizedAccess', {});
            throw new ForbiddenException(response);
        }

        return true;
    }
}
