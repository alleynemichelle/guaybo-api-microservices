export class UpdateUserResponseDto {
    recordId: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    timezone: string;
    defaultLanguage: string;
    registered: boolean;
    federated: boolean;
    verifiedEmail: boolean;
    createdAt: string;
    lastAccess: string;
}
