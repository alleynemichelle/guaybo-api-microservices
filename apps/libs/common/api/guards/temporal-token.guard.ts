import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { TemporalTokenType } from 'apps/libs/common/enums/temporal-token-type.enum';
import { TemporalTokenErrorCodes } from 'apps/libs/common/constants/error-codes.constant';
import { TemporalTokensService } from 'apps/users/src/services/temporal-tokens.service';

/**
 * Guard to validate temporal tokens and ensure they match required token types
 * Attaches validated token data to request for use in controllers
 */
@Injectable()
export class TemporalTokenGuard implements CanActivate {
    constructor(
        private readonly temporalTokensService: TemporalTokensService,
        private readonly reflector: Reflector,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const request = context.switchToHttp().getRequest();

            // Extract token from Authorization header
            const authHeader = request.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                throw new UnauthorizedException(TemporalTokenErrorCodes.TemporalTokenRequired);
            }

            const token = authHeader.replace('Bearer ', '');

            // Validate the temporal token
            const validationResult = await this.temporalTokensService.validateTemporalToken(token);

            // Check if token type matches expected type (if specified in decorator)
            const requiredTokenType = this.reflector.get<TemporalTokenType>('tokenType', context.getHandler());
            if (requiredTokenType && validationResult.tokenType !== requiredTokenType) {
                throw new UnauthorizedException(TemporalTokenErrorCodes.TemporalTokenTypeInvalid);
            }

            // Attach validated token data to request
            request.temporalToken = validationResult;
            request.temporalTokenRaw = token; // Store the original token for marking as used
            request.user = {
                userId: validationResult.userId,
                email: validationResult.email,
            };

            return true;
        } catch (error) {
            if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
                throw error;
            }
            throw new UnauthorizedException(TemporalTokenErrorCodes.TemporalTokenError);
        }
    }
}
