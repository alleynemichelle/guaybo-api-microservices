import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Min,
    ValidateNested,
} from 'class-validator';
import { QuestionType } from 'apps/libs/entities/products/question.entity';
import { AnswerOptionDto } from './answer-option.dto';

export class QuestionDto {
    @ApiProperty({
        description: 'ID of the quiz or survey this question belongs to',
        example: '12345678-abcd-efgh-ijkl-123456789012',
    })
    @IsString()
    @IsNotEmpty()
    resourceId: string;

    @ApiProperty({
        description: 'Text of the question',
        example: 'What is the capital of France?',
    })
    @IsString()
    @IsNotEmpty()
    text: string;

    @ApiProperty({
        enum: QuestionType,
        description: 'Type of the question',
        example: QuestionType.MULTIPLE_CHOICE_SINGLE,
    })
    @IsEnum(QuestionType)
    @IsNotEmpty()
    questionType: QuestionType;

    @ApiPropertyOptional({
        description: 'Answer options for the question',
        type: [AnswerOptionDto],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AnswerOptionDto)
    @IsOptional()
    options?: AnswerOptionDto[];

    @ApiPropertyOptional({
        description: 'Points for this question if answered correctly',
        example: 10,
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    points?: number;

    @ApiPropertyOptional({
        description: 'Explanation for the correct answer',
        example: 'Paris is the capital of France.',
    })
    @IsString()
    @IsOptional()
    explanation?: string;

    @ApiProperty({
        description: 'Order of the question in the list',
        example: 1,
    })
    @IsNumber()
    @Min(1)
    @IsNotEmpty()
    order: number;

    @ApiPropertyOptional({
        description: 'The scale for RATING questions (e.g., 5 for a 1-5 scale)',
        example: 5,
    })
    @IsNumber()
    @Min(2)
    @IsOptional()
    ratingScale?: number;

    @ApiPropertyOptional({
        description: 'Label for the minimum value in a RATING question',
        example: 'Muy insatisfecho',
    })
    @IsString()
    @IsOptional()
    minRatingLabel?: string;

    @ApiPropertyOptional({
        description: 'Label for the maximum value in a RATING question',
        example: 'Muy satisfecho',
    })
    @IsString()
    @IsOptional()
    maxRatingLabel?: string;

    @ApiProperty({
        description: 'Whether the question is required to submit the quiz or survey, default to true',
        example: true,
        default: true,
    })
    @IsBoolean()
    @IsOptional()
    required: boolean = true; // default to true
}
