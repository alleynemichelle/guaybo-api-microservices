import { ApiProperty } from '@nestjs/swagger';
import { ResponseDto } from 'apps/libs/common/api/response.entity';
import { UserResponseDto } from './user-response.dto';
import { AuthSessionResponseDto } from './session-response.dto';

export class CreateUserResponseDataDto {
    @ApiProperty({
        type: UserResponseDto,
    })
    user: UserResponseDto;

    @ApiProperty({
        type: AuthSessionResponseDto,
    })
    session: AuthSessionResponseDto;

    @ApiProperty({
        required: false,
        description: 'Indicates if a required action (e.g., email verification) is pending.',
    })
    requiredAction?: boolean;
}

export class CreateUserResponseDto extends ResponseDto {
    @ApiProperty({
        type: CreateUserResponseDataDto,
        example: {
            user: {
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
                createdAt: '2024-09-06T01:28:42.181Z',
                lastAccess: '2024-11-07T10:15:30.123Z',
                hosts: [
                    {
                        createdAt: '2024-09-06T01:28:42.181Z',
                        hostId: '22b0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a',
                        role: 'ADMIN',
                        status: 'ACTIVE',
                        alias: 'John Doe',
                    },
                ],
            },
            session: {
                tokenId: 'e3fce3b2-bc59-4d61-8beb-17fe3829d571',
                accessToken: 'e3fce3b2-bc59-4d61-8beb-17fe3829d571',
                refreshToken: 'e3fce3b2-bc59-4d61-8beb-17fe3829d571',
                expiresIn: 86400,
            },
            requiredAction: false,
        },
    })
    data: CreateUserResponseDataDto;
}
