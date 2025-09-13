import { ApiProperty } from '@nestjs/swagger';
import { ResponseDto } from 'apps/libs/common/api/response.entity';

export class ConversionRateResponseDto {
    @ApiProperty({
        example: 154.0108,
        description: 'The converted amount based on the current exchange rate.',
    })
    amount: number;

    @ApiProperty({
        example: 'VES',
        description: 'The currency code of the converted amount.',
    })
    currency: string;

    @ApiProperty({
        example: '2025-09-08T16:10:00.550Z',
        description: 'The timestamp when the conversion rate was last updated.',
    })
    updatedAt: string;
}

export class GetConversionRateResponse extends ResponseDto {
    @ApiProperty({
        description: 'Get conversion rate.',
        type: [ConversionRateResponseDto],
        example: [
            {
                amount: 154.0108,
                currency: 'VES',
                updatedAt: '2025-09-08T16:10:00.550Z',
            },
        ],
    })
    data: ConversionRateResponseDto[];
}
