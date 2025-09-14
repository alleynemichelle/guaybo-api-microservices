import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { UsersRepository } from 'apps/libs/database/drizzle/repositories/users.repository';
import { Status } from 'apps/libs/common/enums/status.enum';
import { Host } from 'apps/libs/domain/hosts/hosts.entity';
import { Role } from '../../enums/role.enum';

export interface RequestUser {
    email: string;
    sub: string;
    recordId: string;
    id: number;
    status: Status;
    hosts?: Partial<Host>[];
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
    private cognitoVerifier: CognitoJwtVerifier<any, any, any>;

    constructor(
        private configService: ConfigService,
        private readonly usersRepository: UsersRepository,
    ) {
        const userPoolId = this.configService.get<string>('COGNITO_POOL_ID');
        const clientId = this.configService.get<string>('COGNITO_CLIENT_ID');

        if (!userPoolId || !clientId) {
            throw new Error('COGNITO_POOL_ID and COGNITO_CLIENT_ID must be configured');
        }

        this.cognitoVerifier = CognitoJwtVerifier.create({
            userPoolId: userPoolId,
            tokenUse: 'id',
            clientId: clientId,
        });
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException({
                status: 'error',
                code: 401,
                message: 'Unauthorized',
                data: {},
            });
        }

        try {
            const cognitoPayload = await this.cognitoVerifier.verify(token);
            const recordId = (cognitoPayload['custom:userId'] || cognitoPayload.sub) as string;
            const user = await this.usersRepository.findWithHostsByRecordId(recordId);

            if (!user) {
                throw new UnauthorizedException({
                    status: 'error',
                    code: 401,
                    message: 'Unauthorized',
                    data: {},
                });
            }

            const requestUser: RequestUser = {
                email: user.email,
                recordId: user.recordId!,
                id: user.id!,
                status: user.status as Status,
                sub: cognitoPayload.sub,
                hosts: user.hosts?.map((hostUser) => {
                    return {
                        recordId: hostUser.recordId,
                        name: hostUser.name,
                        alias: hostUser.alias,
                        collectionId: hostUser.collectionId,
                        status: hostUser.status as Status,
                        role: hostUser.role as Role,
                    };
                }),
            };

            request.user = requestUser;
            return true;
        } catch (error) {
            console.error('Cognito token verification failed:', error);
            throw new UnauthorizedException({
                status: 'error',
                code: 401,
                message: 'Unauthorized',
                data: {},
            });
        }
    }

    private extractTokenFromHeader(request: any): string | undefined {
        const authHeader = request.headers.authorization;

        if (!authHeader) {
            return undefined;
        }

        const [type, token] = authHeader.split(' ');
        return type === 'Bearer' ? token : undefined;
    }
}
