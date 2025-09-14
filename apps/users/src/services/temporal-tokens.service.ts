import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { getUTCDate } from 'apps/libs/common/utils/date';
import { TemporalTokenErrorCodes, UsersErrorCodes } from 'apps/libs/common/constants/error-codes.constant';
import { SQSService } from 'apps/libs/integrations/notifications/sqs.service';
import { AppEvent } from 'apps/libs/common/enums/app-event.enum';
import { TemporalTokensRepository } from 'apps/libs/database/drizzle/repositories/temporal-tokens.repository';
import { UsersRepository } from 'apps/libs/database/drizzle/repositories/users.repository';
import { TemporalTokenType } from 'apps/libs/common/enums/temporal-token-type.enum';
import { IUsersAuth } from '../interfaces/users-auth.interface';

/**
 * Options for generating a temporal token
 */
export interface GenerateTemporalTokenOptions {
    userId: number;
    userRecordId: string;
    email: string;
    tokenType: TemporalTokenType;
    bookingId?: string;
    redirectUrl?: string;
    expirationSeconds?: number;
}

/**
 * Options for sending a temporal token via email
 */
export interface SendTemporalTokenOptions {
    userId: string;
    email: string;
    tokenType: TemporalTokenType;
}

/**
 * Result of temporal token validation
 */
export interface TemporalTokenValidationResult {
    isValid: boolean;
    tokenType: TemporalTokenType;
    userId: string;
    email: string;
    redirectUrl: string;
    internalTokenId: string;
    tokenId: number;
}

/**
 * Service for managing temporal tokens functionality
 * Handles generation and validation of secure temporal tokens
 */
@Injectable()
export class TemporalTokensService {
    private readonly temporalTokenSecret: string;
    private readonly frontendUrl: string;
    private readonly defaultExpirationSeconds = 24 * 60 * 60; // 24 hours in seconds
    private readonly notificationsSQS: string;

    constructor(
        @Inject('AuthService') private readonly authService: IUsersAuth,
        private readonly temporalTokensRepository: TemporalTokensRepository,
        private readonly usersRepository: UsersRepository,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly sqsService: SQSService,
    ) {
        this.temporalTokenSecret = this.configService.get('TEMPORAL_TOKEN_JWT_SECRET') || '';
        this.frontendUrl = this.configService.get('FRONTEND_APP_HOST') || 'http://localhost:3000';
        this.notificationsSQS = this.configService.get('NOTIFICATIONS_SQS_URL') || '';
    }

    /**
     * Generates a secure temporal token link for user authentication
     * @param {GenerateTemporalTokenOptions} options - Configuration for temporal token generation
     * @returns {Promise<string>} - The complete temporal token JWT
     */
    async generateTemporalToken(options: GenerateTemporalTokenOptions): Promise<string> {
        try {
            // 1. Create expiration timestamp
            const expiresAt = this.calculateExpiration(options.expirationSeconds || this.defaultExpirationSeconds);

            // 2. Store token in database
            const tokenRecord = await this.temporalTokensRepository.create({
                userId: options.userId,
                tokenType: options.tokenType,
                redirectUrl: options.redirectUrl,
                expiresAt: expiresAt,
                used: false,
            });

            // 3. Create signed JWT token containing the internal record ID and necessary data
            const signedToken = this.jwtService.sign(
                {
                    sub: tokenRecord.recordId,
                    tokenId: tokenRecord.id,
                    tokenType: options.tokenType,
                    type: 'temporal_token',
                    email: options.email,
                    userId: options.userId,
                    userRecordId: options.userRecordId,
                    bookingId: options.bookingId,
                    redirectUrl: options.redirectUrl,
                    iat: Math.floor(Date.now() / 1000),
                },
                {
                    secret: this.temporalTokenSecret,
                    expiresIn: options.expirationSeconds || this.defaultExpirationSeconds,
                },
            );

            return signedToken;
        } catch (error) {
            console.error('Error generating temporal token:', error);
            throw new BadRequestException(TemporalTokenErrorCodes.TemporalTokenError);
        }
    }

    /**
     * Validates a temporal token and returns its information
     * @param {string} signedToken - The JWT signed token from the temporal token link
     * @returns {Promise<TemporalTokenValidationResult>} - Validation result with token information
     */
    async validateTemporalToken(signedToken: string): Promise<TemporalTokenValidationResult> {
        try {
            // 1. Verify and decode the JWT token
            const payload = this.jwtService.verify(signedToken, {
                secret: this.temporalTokenSecret,
            });

            // 2. Validate token structure
            if (payload.type !== 'temporal_token' || !payload.sub) {
                throw new BadRequestException(TemporalTokenErrorCodes.TemporalTokenInvalid);
            }

            // 3. Get token from database to check if it exists and is not used
            const tokenRecord = await this.temporalTokensRepository.findByRecordId(payload.sub);

            // If database lookup is not available, use enhanced JWT validation
            if (!tokenRecord) throw new BadRequestException(TemporalTokenErrorCodes.TemporalTokenNotFound);

            // 4. Check if token is already used
            if (tokenRecord.used) {
                throw new BadRequestException(TemporalTokenErrorCodes.TemporalTokenUsed);
            }

            // 5. Check if token is expired (double check with database)
            const now = new Date();
            const expiresAt = new Date(tokenRecord.expiresAt);

            if (now > expiresAt) {
                throw new BadRequestException(TemporalTokenErrorCodes.TemporalTokenExpired);
            }

            // 6. Validate token data consistency between JWT and database
            if (
                tokenRecord.user?.email !== payload.email ||
                tokenRecord.user?.id !== payload.userId ||
                tokenRecord.tokenType !== payload.tokenType
            ) {
                throw new BadRequestException(TemporalTokenErrorCodes.TemporalTokenInconsistent);
            }

            console.log(`Token validation successful for user: ${payload.email}`);

            return {
                internalTokenId: payload.sub,
                tokenId: tokenRecord.id,
                isValid: true,
                tokenType: payload.tokenType,
                userId: payload.userId || '',
                email: payload.email,
                redirectUrl: payload.redirectUrl || '',
            };
        } catch (error: any) {
            if (error.name === 'JsonWebTokenError') {
                throw new BadRequestException(TemporalTokenErrorCodes.TemporalTokenInvalid);
            } else if (error.name === 'TokenExpiredError') {
                throw new BadRequestException(TemporalTokenErrorCodes.TemporalTokenExpired);
            } else if (error instanceof BadRequestException) {
                throw error;
            }

            console.error('Error validating temporal token:', error);
            throw new BadRequestException(TemporalTokenErrorCodes.TemporalTokenError);
        }
    }

    /**
     * Marks a temporal token as used to prevent reuse
     * @param {string} signedToken - The JWT signed token to mark as used
     * @returns {Promise<void>}
     */
    async markTokenAsUsed(signedToken: string): Promise<void> {
        try {
            const validation = await this.validateTemporalToken(signedToken);

            // Mark token as used in database
            await this.temporalTokensRepository.update(validation.tokenId, { used: true });
        } catch (error) {
            console.error('Error marking token as used:', error);
            throw error;
        }
    }

    /**
     * Sends a temporal token via email after validation
     * @param {SendTemporalTokenOptions} options - Configuration for temporal token sending
     * @returns {Promise<void>}
     */
    async sendTemporalToken(options: SendTemporalTokenOptions): Promise<void> {
        try {
            // 1. Validate user exists and registration status for COMPLETE_REGISTRATION type
            // Check if user exists in database
            const user = await this.usersRepository.findByEmail(options.email);
            if (!user) throw new BadRequestException(TemporalTokenErrorCodes.TemporalTokenError);

            await this.validateUserForCompleteRegistration(options.email);

            // 2. Generate the temporal token
            const signedToken = await this.generateTemporalToken({
                userId: user.id!,
                userRecordId: user.recordId!,
                email: options.email,
                tokenType: options.tokenType,
            });

            // 3. Create authentication URL
            const authenticationUrl = `${this.frontendUrl}/set-credentials?token=${signedToken}`;

            // 4. Send email notification
            await this.sendEmailNotification(options.email, authenticationUrl, options.tokenType);

            console.log(`Temporal token sent successfully to: ${options.email}`);
        } catch (error) {
            console.error('Error sending temporal token:', error);
            throw error;
        }
    }

    /**
     * Validates that user exists but is not fully registered for COMPLETE_REGISTRATION tokens
     * @param {string} userId - User ID to validate
     * @param {string} email - Email to validate
     * @returns {Promise<void>}
     */
    private async validateUserForCompleteRegistration(email: string): Promise<void> {
        try {
            // Check if user is already fully registered
            const authRegistered = await this.authService.userExists(email);
            console.log('authRegistered', authRegistered);
            if (authRegistered) throw new BadRequestException(UsersErrorCodes.UserRegistrationAlreadyCompleted);

            console.log(`User validation successful for COMPLETE_REGISTRATION: ${email}`);
        } catch (error) {
            console.error('Error validating user for complete registration:', error);
            throw error;
        }
    }

    /**
     * Sends email notification with temporal token
     * @param {string} email - Recipient email address
     * @param {string} authenticationUrl - Complete authentication URL with token
     * @param {TemporalTokenType} tokenType - Type of token for template selection
     * @returns {Promise<void>}
     */
    private async sendEmailNotification(
        email: string,
        authenticationUrl: string,
        tokenType: TemporalTokenType,
    ): Promise<void> {
        try {
            let templateKey = '';

            // Select appropriate email template based on token type
            switch (tokenType) {
                case TemporalTokenType.COMPLETE_REGISTRATION:
                    templateKey = 'temporal-token-complete-registration';
                    break;
                case TemporalTokenType.LOGIN_REDIRECT:
                case TemporalTokenType.PASSWORD_RESET:
                default:
                    // For future token types, we can add specific templates
                    templateKey = 'temporal-token-complete-registration';
                    break;
            }

            const notification = JSON.stringify({
                type: 'email',
                templateKey,
                event: AppEvent.APP_NOTIFICATION,
                to: email,
                dynamicTemplateData: {
                    temporalToken: {
                        authenticationUrl,
                    },
                },
            });

            await this.sqsService.sendMessage(this.notificationsSQS, notification);

            console.log(`Email notification queued for: ${email} with template: ${templateKey}`);
        } catch (error) {
            console.error('Error sending email notification:', error);
            throw new BadRequestException('Error enviando notificación por correo');
        }
    }

    /**
     * Calculates expiration date based on seconds from now
     * @param {number} seconds - Seconds until expiration
     * @returns {Date} - Expiration date
     */
    private calculateExpiration(seconds: number): Date {
        const expiration = getUTCDate();
        expiration.setSeconds(expiration.getSeconds() + seconds);
        return expiration;
    }
}
