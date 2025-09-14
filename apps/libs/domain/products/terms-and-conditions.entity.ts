import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString } from 'class-validator';

export class TermsAndConditions {
    @ApiProperty({
        description: 'The date when the terms and conditions were last updated (ISO 8601 format with timezone)',
        example: '2025-01-01T00:00:00Z',
    })
    @IsDateString()
    updatedAt: string;

    @ApiProperty({
        description: 'The content of the terms and conditions',
        example: 'By using this service, you agree to the following terms...',
    })
    @IsString()
    content: string;
}
