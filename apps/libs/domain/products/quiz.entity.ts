import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, Max, Min } from 'class-validator';

/**
 * Enum for when to show correct answers
 */
export enum ShowCorrectAnswersType {
    IMMEDIATELY = 'IMMEDIATELY',
    AFTER_SUBMISSION = 'AFTER_SUBMISSION',
    NEVER = 'NEVER',
}

/**
 * Entity that represents a quiz configuration
 */
export class Quiz {
    @ApiProperty({
        description: 'Indicates if the quiz is graded',
        example: true,
    })
    @IsBoolean()
    @IsNotEmpty()
    isGraded: boolean;

    @ApiPropertyOptional({
        description: 'Minimum score to pass the quiz (0-100)',
        example: 70,
    })
    @IsNumber()
    @Min(0)
    @Max(100)
    @IsOptional()
    passingScore?: number;

    @ApiPropertyOptional({
        description: 'Time limit to complete the quiz in minutes',
        example: 60,
    })
    @IsNumber()
    @Min(1)
    @IsOptional()
    timeLimitMinutes?: number;

    @ApiPropertyOptional({
        description: 'Number of allowed attempts. 0 for unlimited.',
        example: 3,
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    allowedAttempts?: number;

    @ApiPropertyOptional({
        enum: ShowCorrectAnswersType,
        description: 'When to show correct answers to the user',
        example: ShowCorrectAnswersType.AFTER_SUBMISSION,
    })
    @IsEnum(ShowCorrectAnswersType)
    @IsOptional()
    showCorrectAnswers?: ShowCorrectAnswersType;

    constructor(quiz: Partial<Quiz>) {
        Object.assign(this, quiz);
    }
}
