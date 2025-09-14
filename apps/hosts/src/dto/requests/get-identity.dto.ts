import { ApiProperty } from '@nestjs/swagger';

export class GetIdentityDto {
    @ApiProperty({ description: 'Creation date of the identity record' })
    createdAt: string;

    @ApiProperty({ description: 'Age of the host' })
    age: number;

    @ApiProperty({ description: 'Full name of the host' })
    fullName: string;

    @ApiProperty({ description: 'First name of the host' })
    firstName: string;

    @ApiProperty({ description: 'Last name of the host' })
    lastName: string;

    @ApiProperty({ description: 'State that issued the document' })
    issuingState: string;

    @ApiProperty({ description: 'Document number' })
    documentNumber: string;

    @ApiProperty({ description: 'Date of birth' })
    dateOfBirth: string;

    @ApiProperty({ description: 'Date when the document was issued' })
    dateOfIssue: string;

    @ApiProperty({ description: 'Type of document' })
    documentType: string;

    @ApiProperty({ description: 'Document expiration date' })
    expirationDate: string;

    @ApiProperty({ description: 'Personal number' })
    personalNumber?: string;
}
