import { ApiProperty } from '@nestjs/swagger';
import { ResponseDto } from 'apps/libs/common/api/response.entity';

export class PaymentOptionDto {
    @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
    recordId: string;

    @ApiProperty({ example: 'ZELLE' })
    paymentMethod: string;

    @ApiProperty({ example: 'ACTIVE' })
    status: string;

    @ApiProperty({ example: 'John Doe' })
    fullName: string;

    @ApiProperty({ example: 'john.doe@example.com' })
    email: string;

    @ApiProperty({ example: '123456789' })
    phoneNumber: string;
}

export class GetPaymentOptionsResponseDto extends ResponseDto {
    @ApiProperty({
        type: [PaymentOptionDto],
        example: [
            {
                recordId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
                paymentMethod: 'ZELLE',
                status: 'ACTIVE',
                fullName: 'John Doe',
                email: 'john.doe@example.com',
                phoneNumber: '123456789',
            },
        ],
    })
    data: PaymentOptionDto[];
}
