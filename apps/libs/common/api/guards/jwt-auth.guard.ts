import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    private cognitoVerifier: CognitoJwtVerifier<any, any, any>;

    constructor(private configService: ConfigService) {
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

            // Transform Cognito payload to match our user structure
            request.user = {
                id: cognitoPayload['custom:userId'] || cognitoPayload.sub,
                email:
                    typeof cognitoPayload.email === 'string'
                        ? cognitoPayload.email.toLowerCase()
                        : cognitoPayload.email,
                sub: cognitoPayload.sub,
            };

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
