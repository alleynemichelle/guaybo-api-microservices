import { AttributeType } from '@aws-sdk/client-cognito-identity-provider';

import { AuthRedirectType } from 'apps/libs/common/enums/auth.enum';

export interface Session {
    tokenId: string;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface IUsersAuth {
    createUser(user: {
        email: string;
        password: string;
        recordId: string;
        status: string;
        defaultLanguage?: string;
        verifiedEmail?: boolean;
    }): Promise<void>;
    confirmAccount(data: { email: string; code: string }): Promise<void>;
    userExists(email: string): Promise<boolean>;
    getUserEntities(email: string): Promise<any[] | undefined>;
    authenticate(credentials: { email: string; password: string }): Promise<Session>;
    authenticateFederatedUser(code: string, redirectUri: string): Promise<Session>;
    refreshToken(email: string): Promise<Session>;
    recoverPassword(email: string, redirectType: AuthRedirectType): Promise<void>;
    sendConfirmationCode(email: string): Promise<void>;
    logout(token: string): Promise<void>;
    resetPassword(code: string, newPassword: string, email: string): Promise<void>;
    changePassword(oldPassword: string, newPassword: string, accessToken: string): Promise<void>;
    deleteUser(username: string): Promise<void>;
    addUserCustomAttributes(username: string, attributes: AttributeType[]): Promise<void>;
    handleNewPasswordRequired(
        session: string,
        challengeResponse: { newPassword: string; username: string },
    ): Promise<Session>;
}
