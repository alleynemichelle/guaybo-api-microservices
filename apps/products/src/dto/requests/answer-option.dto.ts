import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AnswerOptionDto {
    @ApiPropertyOptional({
        description: 'ID of the answer option',
        example: '12345678-abcd-efgh-ijkl-123456789012',
    })
    @IsString()
    @IsOptional()
    id?: string;

    @ApiProperty({
        description: 'Text of the answer option',
        example: 'This is a possible answer.',
    })
    @IsString()
    @IsNotEmpty()
    text: string;

    @ApiPropertyOptional({
        description: 'Indicates if this option is the correct answer',
        example: true,
    })
    @IsBoolean()
    @IsOptional()
    isCorrect?: boolean;
}
