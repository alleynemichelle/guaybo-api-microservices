import { IsString, IsUUID, IsUrl, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateKycSessionDto {
    @ApiProperty({
        description: 'User identifier',
        example: '0220439a-d3ea-408b-b05a-5e2e5316325a',
    })
    @IsUUID()
    userId: string;

    @ApiProperty({
        description: 'Session identifier',
        example: '0220439a-d3ea-408b-b05a-5e2e5316325a',
    })
    @IsUUID()
    sessionId: string;

    @ApiProperty({
        description: 'The workflow ID to use for this verification session',
        example: 'workflow_123',
        required: false,
    })
    @IsString()
    @IsOptional()
    workflow_id?: string;

    @ApiProperty({
        description: 'The URL to redirect to after the verification is complete',
        example: 'https://example.com/success',
        required: false,
    })
    @IsUrl()
    @IsOptional()
    success_url?: string;

    @ApiProperty({
        description: 'The URL to redirect to if the user cancels the verification',
        example: 'https://example.com/cancel',
        required: false,
    })
    @IsUrl()
    @IsOptional()
    cancel_url?: string;

    @ApiProperty({
        description: 'The language to use for the verification interface',
        example: 'es',
        required: false,
    })
    @IsString()
    @IsOptional()
    language?: string;
}
