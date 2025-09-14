import { ApiProperty } from '@nestjs/swagger';
import { ResponseDto } from 'apps/libs/common/api/response.entity';

class PhoneNumberDto {
    @ApiProperty({ example: '+58' })
    code: string;

    @ApiProperty({ example: '4142312123' })
    number: string;
}

class TagDto {
    @ApiProperty({ example: '#004AAD' })
    color: string;

    @ApiProperty({ example: 'Emprendimiento' })
    value: string;

    @ApiProperty({ example: 'Emprendimiento_#004AAD' })
    key: string;
}

export class CustomerDetailsDto {
    @ApiProperty({ example: '2025-06-12T21:23:24.120Z' })
    createdAt: string;

    @ApiProperty({ example: '2025-06-12T21:23:24.120Z' })
    updatedAt: string;

    @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
    userId: string;

    @ApiProperty({ example: 'f0e9d8c7-b6a5-4321-fedc-ba9876543210' })
    recordId: string;

    @ApiProperty({ example: 'John' })
    firstName: string;

    @ApiProperty({ example: 'Doe' })
    lastName: string;

    @ApiProperty({ example: 'John Doe' })
    fullName: string;

    @ApiProperty({ example: 'john.doe@example.com' })
    email: string;

    @ApiProperty({ example: 'john.doe.insta', required: false })
    instagramAccount?: string;

    @ApiProperty({ example: 15 })
    totalBookings: number;

    @ApiProperty({ type: PhoneNumberDto, required: false })
    phoneNumber?: PhoneNumberDto;

    @ApiProperty({ type: [TagDto], required: false })
    tags?: TagDto[];
}

export class GetCustomerResponseDto extends ResponseDto {
    @ApiProperty({
        type: CustomerDetailsDto,
        example: {
            createdAt: '2025-06-12T21:23:24.120Z',
            updatedAt: '2025-06-12T21:23:24.120Z',
            userId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
            recordId: 'f0e9d8c7-b6a5-4321-fedc-ba9876543210',
            firstName: 'John',
            lastName: 'Doe',
            fullName: 'John Doe',
            email: 'john.doe@example.com',
            instagramAccount: 'john.doe.insta',
            totalBookings: 15,
            phoneNumber: {
                code: '+58',
                number: '4142312123',
            },
            tags: [
                {
                    color: '#004AAD',
                    value: 'Emprendimiento',
                    key: 'Emprendimiento_#004AAD',
                },
            ],
        },
    })
    data: CustomerDetailsDto;
}
