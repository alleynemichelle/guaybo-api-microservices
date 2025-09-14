import qs from 'qs';
import { firstValueFrom } from 'rxjs';

import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';

import {
    AdminUpdateUserAttributesCommand,
    CognitoIdentityProviderClient,
    InitiateAuthCommand,
    AuthFlowType,
    GlobalSignOutCommand,
    ConfirmForgotPasswordCommand,
    ForgotPasswordCommand,
    ChangePasswordCommand,
    AttributeType,
    InitiateAuthCommandOutput,
    AdminDeleteUserCommand,
    AdminCreateUserCommand,
    MessageActionType,
    AdminSetUserPasswordCommand,
    RespondToAuthChallengeCommandInput,
    RespondToAuthChallengeCommand,
    ChallengeNameType,
    ConfirmSignUpCommand,
    ResendConfirmationCodeCommand,
    ListUsersCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { UsersErrorCodes } from 'apps/libs/common/constants/error-codes.constant';
import { Timer } from 'apps/libs/common/api/decorators/timer.decorator';
import { AuthRedirectType } from 'apps/libs/common/enums/auth.enum';
import { Language } from 'apps/libs/common/enums/language.enum';
import { IUsersAuth } from '../interfaces/users-auth.interface';

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

@Injectable()
export class UsersCognitoService implements IUsersAuth {
    private cognitoClient: CognitoIdentityProviderClient;
    private region: string;
    private cognitoClientId: string;
    private userPoolId: string;
    private domain: string;

    constructor(
        private configService: ConfigService,
        private readonly httpService: HttpService,
    ) {
        this.region = this.configService.get('REGION') as string;
        this.domain = this.configService.get('COGNITO_DOMAIN_HOST') as string;
        this.cognitoClientId = this.configService.get('COGNITO_CLIENT_ID') as string;
        this.userPoolId = this.configService.get('COGNITO_POOL_ID') as string;
        this.cognitoClient = new CognitoIdentityProviderClient({
            region: this.region,
        });
    }

    /**
     * Allows to create a user using Amazon Cognito service
     * @param {User} user data to be registered in Amazon Cognito
     */
    public async createUser(user: {
        email: string;
        password: string;
        recordId: string;
        status: string;
        defaultLanguage: string;
        verifiedEmail?: boolean;
    }): Promise<void> {
        try {
            await this.cognitoClient.send(
                new AdminCreateUserCommand({
                    UserPoolId: this.userPoolId,
                    Username: user.email,
                    MessageAction: MessageActionType.SUPPRESS,
                    TemporaryPassword: user.password,
                    UserAttributes: [
                        {
                            Name: 'email',
                            Value: user.email,
                        },
                        {
                            Name: 'custom:userId',
                            Value: user.recordId,
                        },
                        {
                            Name: 'custom:status',
                            Value: user.status,
                        },
                        {
                            Name: 'custom:defaultLanguage',
                            Value: user.defaultLanguage ?? Language.ES,
                        },
                        ...(user.verifiedEmail ? [{ Name: 'email_verified', Value: 'true' }] : []),
                    ],
                }),
            );

            await this.cognitoClient.send(
                new AdminSetUserPasswordCommand({
                    UserPoolId: this.userPoolId,
                    Password: user.password,
                    Username: user.email,
                    Permanent: true,
                }),
            );
        } catch (error: any) {
            console.log('Error signing up user in cognito: ', error);
            let errorName = UsersErrorCodes[error.name] ?? UsersErrorCodes.AuthException;
            throw new BadRequestException(errorName);
        }
    }

    /**
     * Send a verification code to confirm user account
     * @param {ConfirmSignUpDTO} ConfirmSignUpDTO contains email and confirmation code
     * @returns {Promise<void>}
     */
    public async confirmAccount(data: { email: string; code: string }): Promise<void> {
        try {
            await this.cognitoClient.send(
                new ConfirmSignUpCommand({
                    ClientId: this.cognitoClientId,
                    Username: data.email,
                    ConfirmationCode: data.code,
                }),
            );
        } catch (err: any) {
            console.log('Error confirming account in cognito: ', err);
            const errorName = err.message.includes('Current status is CONFIRMED')
                ? UsersErrorCodes.UserIsAlreadyConfirmed
                : UsersErrorCodes[err.name] || UsersErrorCodes.AuthException;

            throw new BadRequestException(errorName);
        }
    }

    /**
     * Authenticates user using Amazon Cognito
     * @param {string} email corresponds to user's email to authenticate in the web app
     * @param {string} password user's password for authentication
     * @returns {Promise<Session>} response containing all data needed for handling user's session
     */
    public async authenticate(data: { email: string; password: string }): Promise<{
        tokenId: string;
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        session?: string;
        challenge?: string;
    }> {
        try {
            const response: InitiateAuthCommandOutput = await this.cognitoClient.send(
                new InitiateAuthCommand({
                    AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
                    ClientId: this.cognitoClientId,
                    AuthParameters: {
                        USERNAME: data.email,
                        PASSWORD: data.password,
                    },
                }),
            );

            return {
                tokenId: response.AuthenticationResult?.IdToken as string,
                accessToken: response.AuthenticationResult?.AccessToken as string,
                refreshToken: response.AuthenticationResult?.RefreshToken as string,
                expiresIn: response.AuthenticationResult?.ExpiresIn as number,
                session: response.Session,
                challenge: response.ChallengeName,
            };
        } catch (error: any) {
            console.log('Error logging user in cognito: ', error);
            const errorName = UsersErrorCodes[error.name] ?? UsersErrorCodes.AuthException;
            throw new BadRequestException(errorName);
        }
    }

    /**
     * Authenticates federated user using Amazon Cognito
     * @param {string} code corresponds to code obtained from the federated login
     * @returns {Promise<Session>} response containing all data needed for handling user's session
     */
    public async authenticateFederatedUser(
        code: string,
        redirectUri: string,
    ): Promise<{
        tokenId: string;
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        session?: string;
        challenge?: string;
    }> {
        try {
            const data = qs.stringify({
                grant_type: 'authorization_code',
                client_id: this.cognitoClientId,
                redirect_uri: redirectUri,
                code,
            });

            const options = {
                headers: { 'content-type': 'application/x-www-form-urlencoded' },
            };

            const response = (await firstValueFrom(
                this.httpService.post(`${this.domain}/oauth2/token`, data, options),
            )) as {
                data: {
                    id_token: string;
                    access_token: string;
                    refresh_token: string;
                    expires_in: number;
                };
            };

            return {
                tokenId: response.data.id_token as string,
                accessToken: response.data.access_token,
                refreshToken: response.data.refresh_token,
                expiresIn: response.data.expires_in,
            };
        } catch (err: any) {
            console.log('Error logging user in cognito: ', err);

            const errorName = UsersErrorCodes[err.response.data.error] ?? UsersErrorCodes.AuthException;
            throw new BadRequestException(errorName);
        }
    }

    public async handleNewPasswordRequired(
        session: string,
        challengeResponse: { newPassword: string; username: string },
    ): Promise<{
        accessToken: string;
        tokenId: string;
        refreshToken: string;
        expiresIn: number;
        session?: string;
        challenge?: string;
    }> {
        const input: RespondToAuthChallengeCommandInput = {
            ChallengeName: ChallengeNameType.NEW_PASSWORD_REQUIRED,
            ClientId: this.cognitoClientId,
            Session: session,
            ChallengeResponses: {
                USERNAME: challengeResponse.username,
                NEW_PASSWORD: challengeResponse.newPassword,
            },
        };

        try {
            const command = new RespondToAuthChallengeCommand(input);
            const response = await this.cognitoClient.send(command);

            if (response.AuthenticationResult) {
                return {
                    accessToken: response.AuthenticationResult.AccessToken as string,
                    tokenId: response.AuthenticationResult.IdToken as string,
                    refreshToken: response.AuthenticationResult.RefreshToken as string,
                    expiresIn: response.AuthenticationResult.ExpiresIn as number,
                    session: response.Session,
                };
            } else {
                throw new Error('Challenge response did not result in an authentication.');
            }
        } catch (error: any) {
            console.log('Error handling new password ', error);

            let errorName = error.name == 'CodeMismatchException' ? UsersErrorCodes.InvalidSessionToken : null;
            if (!errorName) errorName = UsersErrorCodes[error.name] ?? UsersErrorCodes.AuthException;

            throw new BadRequestException(errorName);
        }
    }

    /**
     * Allows to add a user to the specific group in cognito according to the user type
     * @param {string} username  email or sub identifier
     * @param {AttributeType[]} attributes attributes to be added to the user
     */
    public async addUserCustomAttributes(username: string, attributes: AttributeType[]): Promise<void> {
        try {
            await this.cognitoClient.send(
                new AdminUpdateUserAttributesCommand({
                    UserPoolId: this.userPoolId,
                    Username: username,
                    UserAttributes: attributes,
                }),
            );
        } catch (error: any) {
            console.log(`Error adding attributes to user in cognito: `, error);
            let errorName = UsersErrorCodes[error.name] ?? UsersErrorCodes.AuthException;
            throw new BadRequestException(errorName);
        }
    }

    /**
     * Checks if the user is already registered in the app
     * @param email corresponds to user's email to sign up in the web app
     * @returns {Promise<boolean>} response indicating if the user is already registered in the application
     */
    public async userExists(email: string): Promise<boolean> {
        const maxRetries = 3;
        const delay = 1000; // 1 second

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const command = new ListUsersCommand({
                    UserPoolId: this.userPoolId,
                    Filter: `email = "${email}"`,
                    Limit: 1,
                });
                const response = await this.cognitoClient.send(command);

                if ((response.Users?.length ?? 0) > 0) {
                    return true;
                }

                console.log('retrying auth user exists. Attempt: ', attempt);
                if (attempt < maxRetries) {
                    await sleep(delay);
                }
            } catch (error) {
                console.error(`Error in userExists for email: ${email} on attempt ${attempt}`, error);
                // On the last attempt, rethrow the error. Otherwise, we can just let it retry.
                if (attempt === maxRetries) {
                    throw error;
                }
            }
        }
        return false;
    }

    @Timer('getUserEntities')
    public async getUserEntities(email: string): Promise<any[] | undefined> {
        const command = new ListUsersCommand({
            UserPoolId: this.userPoolId,
            Filter: `email = "${email}"`,
        });
        const response = await this.cognitoClient.send(command);

        return response.Users;
    }

    /**
     * Refresh authentication token
     * @param {string} token previous user authentication token
     * @returns {Promise<AuthDataDTO>} response containing all data needed for handling user's session
     */
    public async refreshToken(token: string): Promise<{
        tokenId: string;
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        session?: string;
        challenge?: string;
    }> {
        try {
            const cognitoResponse = await this.cognitoClient.send(
                new InitiateAuthCommand({
                    ClientId: this.cognitoClientId,
                    AuthFlow: AuthFlowType.REFRESH_TOKEN_AUTH,
                    AuthParameters: {
                        REFRESH_TOKEN: token,
                    },
                }),
            );

            return {
                tokenId: cognitoResponse.AuthenticationResult?.IdToken as string,
                accessToken: cognitoResponse.AuthenticationResult?.AccessToken as string,
                refreshToken: cognitoResponse.AuthenticationResult?.RefreshToken
                    ? (cognitoResponse.AuthenticationResult?.RefreshToken as string)
                    : token,
                expiresIn: cognitoResponse.AuthenticationResult?.ExpiresIn as number,
                session: cognitoResponse.Session,
            };
        } catch (error: any) {
            console.log('Error refreshing token', error);
            let errorName = UsersErrorCodes[error.name] ?? UsersErrorCodes.AuthException;
            throw new BadRequestException(errorName);
        }
    }

    /**
     * Executes the request to recover user password.
     * It sends a confirmation code that is required to change the user's password.
     * @param {string} email user email
     */
    public async recoverPassword(email: string, redirectType: AuthRedirectType): Promise<void> {
        try {
            await this.cognitoClient.send(
                new ForgotPasswordCommand({
                    ClientId: this.cognitoClientId,
                    Username: email,
                    ClientMetadata: {
                        redirectType,
                    },
                }),
            );
        } catch (error: any) {
            console.log('Error recovering password: ', error);
            let errorName = UsersErrorCodes[error.name] ?? UsersErrorCodes.AuthException;
            throw new BadRequestException(errorName);
        }
    }

    /**
     * Resend a verification code to confirm user account
     * @param {string} email user email needed to send confirmation code
     */
    public async sendConfirmationCode(email: string): Promise<void> {
        try {
            await this.cognitoClient.send(
                new ResendConfirmationCodeCommand({
                    ClientId: this.cognitoClientId,
                    Username: email,
                }),
            );
        } catch (err: any) {
            console.log('Error resending confirmation code in cognito: ', err);
            let errorName = err.message.includes('User is already confirmed')
                ? UsersErrorCodes.UserIsAlreadyConfirmed
                : UsersErrorCodes[err.name] || UsersErrorCodes.AuthException;
            throw new BadRequestException(errorName);
        }
    }

    /**
     * Invalidates user access token
     * @param {string} token previous user authentication token
     */
    public async logout(token: string): Promise<void> {
        try {
            await this.cognitoClient.send(
                new GlobalSignOutCommand({
                    AccessToken: token,
                }),
            );
        } catch (error: any) {
            console.log('Error logging out in cognito: ', error);
            let errorName = UsersErrorCodes[error.name] ?? UsersErrorCodes.AuthException;
            throw new BadRequestException(errorName);
        }
    }

    /**
     * Allows to reset a forgotten password given a confirmation code
     * @param {string} code confirmation code sent to email
     * @param {string} newPassword new password
     * @param {string} email user's email
     */
    public async resetPassword(code: string, newPassword: string, email: string): Promise<void> {
        try {
            await this.cognitoClient.send(
                new ConfirmForgotPasswordCommand({
                    ClientId: this.cognitoClientId,
                    Username: email,
                    Password: newPassword,
                    ConfirmationCode: code,
                }),
            );
        } catch (error: any) {
            console.log('Error resetting password in cognito: ', error);
            let errorName = UsersErrorCodes[error.name] ?? UsersErrorCodes.AuthException;
            throw new BadRequestException(errorName);
        }
    }

    /**
     * Allows to change password given the old password and the access token
     * @param {string}  oldPassword  previous password
     * @param {string}  newPassword  new password
     * @param {string}  accessToken  session credentials
     */
    public async changePassword(oldPassword: string, newPassword: string, accessToken: string): Promise<void> {
        try {
            await this.cognitoClient.send(
                new ChangePasswordCommand({
                    AccessToken: accessToken,
                    PreviousPassword: oldPassword,
                    ProposedPassword: newPassword,
                }),
            );
        } catch (error: any) {
            console.log('Error changing password in cognito: ', error);
            let errorName = UsersErrorCodes[error.name] ?? UsersErrorCodes.AuthException;
            throw new BadRequestException(errorName);
        }
    }

    /**
     * Allows to delete a user from the cognito pool
     * @param {string}  username  identifier on cognito
     */
    public async deleteUser(username: string): Promise<void> {
        try {
            const input = {
                UserPoolId: this.userPoolId,
                Username: username,
            };
            const command = new AdminDeleteUserCommand(input);
            const response = await this.cognitoClient.send(command);
        } catch (error) {
            console.log('Error deleting user from cognito. Continue process without throw error', error);
        }
    }
}
