import { ApiProperty } from '@nestjs/swagger';
import { ResponseDto } from 'apps/libs/common/api/response.entity';
import { Role } from 'apps/libs/common/enums/role.enum';
import { Status } from 'apps/libs/common/enums/status.enum';
import { PhoneNumber } from 'apps/libs/domain/common/phone-number.entity';

export class UserResponseDataDto {
    @ApiProperty({ example: 'e3fce3b2-bc59-4d61-8beb-17fe3829d571' })
    recordId: string;
    @ApiProperty({ example: 'John' })
    firstName: string;
    @ApiProperty({ example: 'Doe' })
    lastName: string;
    @ApiProperty({ example: 'John Doe' })
    fullName: string;
    @ApiProperty({ example: 'john.doe@example.com' })
    email: string;
    @ApiProperty({ example: 'America/Caracas' })
    timezone: string;
    @ApiProperty({ enum: Status, example: Status.ACTIVE })
    status: string;
    @ApiProperty({ example: 'ES' })
    defaultLanguage: string;

    @ApiProperty({ example: '@john.doe' })
    instagramAccount: string;

    @ApiProperty({ example: true })
    isReferrer?: boolean;

    @ApiProperty({
        example: {
            code: '+58',
            number: '4121234567',
        },
    })
    phoneNumber?: PhoneNumber;

    @ApiProperty({ example: true })
    registered: boolean;
    @ApiProperty({ example: false })
    federated: boolean;
    @ApiProperty({ example: true })
    verifiedEmail: boolean;
    @ApiProperty({ example: '2024-09-06T01:28:42.181Z' })
    createdAt: string;
    @ApiProperty({ example: '2024-11-07T10:15:30.123Z' })
    lastAccess: string;
    @ApiProperty({
        example: [
            {
                createdAt: '2024-09-06T01:28:42.181Z',
                hostId: '22b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a',
                role: Role.ADMIN,
                status: Status.ACTIVE,
                alias: 'John Doe',
                name: 'John Doe',
            },
        ],
        required: false,
    })
    hosts?: {
        createdAt: string;
        hostId: string;
        role: Role;
        status: Status;
        alias: string;
        name: string;
        collectionId: string;
    }[];
}

export class UserResponseDto extends ResponseDto {
    @ApiProperty({
        type: UserResponseDataDto,
        example: {
            recordId: 'e3fce3b2-bc59-4d61-8beb-17fe3829d571',
            firstName: 'John',
            lastName: 'Doe',
            fullName: 'John Doe',
            email: 'john.doe@example.com',
            timezone: 'America/Caracas',
            status: 'ACTIVE',
            defaultLanguage: 'ES',
            registered: true,
            federated: false,
            verifiedEmail: true,
            instagramAccount: 'john.doe',
            isReferrer: true,
            phoneNumber: {
                code: '+58',
                number: '4121234567',
            },
            createdAt: '2024-09-06T01:28:42.181Z',
            lastAccess: '2024-11-07T10:15:30.123Z',
            hosts: [
                {
                    createdAt: '2024-09-06T01:28:42.181Z',
                    hostId: '22b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a',
                    role: 'ADMIN',
                    status: 'ACTIVE',
                    alias: 'John Doe',
                    name: 'John Doe',
                },
            ],
        },
    })
    data: UserResponseDataDto;
}
