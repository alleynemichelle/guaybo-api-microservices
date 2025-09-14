import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { AnswerOption } from 'apps/libs/entities/products/question.entity';

export class UpdateQuestionDto {
    @ApiPropertyOptional({
        description: 'Text of the question',
        example: 'What is the capital of France?',
    })
    @IsString()
    @IsOptional()
    text?: string;

    @ApiPropertyOptional({
        description: 'Duration of the resource in minutes',
        example: 45,
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    duration?: number;

    @ApiPropertyOptional({
        description: 'Answer options for the question',
        type: [AnswerOption],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AnswerOption)
    @IsOptional()
    options?: AnswerOption[];

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
}
