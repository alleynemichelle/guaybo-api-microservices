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
import { v4 as uuidv4 } from 'uuid';

import { DatabaseKeys } from 'apps/libs/common/enums/database-keys.enum';
import { getUTCDate } from 'apps/libs/common/utils/date';
import { Base } from '../common/base.entity';

/**
 * Enum for question types
 */
export enum QuestionType {
    MULTIPLE_CHOICE_SINGLE = 'MULTIPLE_CHOICE_SINGLE',
    MULTIPLE_CHOICE_MULTIPLE = 'MULTIPLE_CHOICE_MULTIPLE',
    TRUE_FALSE = 'TRUE_FALSE',
    OPEN_TEXT = 'OPEN_TEXT',
    RATING = 'RATING',
}

/**
 * Entity that represents an answer option for a question
 */
export class AnswerOption {
    @ApiProperty({
        description: 'ID of the answer option',
        example: '12345678-abcd-efgh-ijkl-123456789012',
    })
    @IsString()
    @IsNotEmpty()
    recordId: string;

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

    constructor(option: Partial<AnswerOption>) {
        Object.assign(this, option);
        this.recordId = option.recordId || uuidv4();
    }
}

/**
 * Entity that represents a question in a quiz or survey
 */
export class Question extends Base {
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

    @ApiProperty({
        description: 'Order of the question in the list',
        example: 1,
    })
    @IsNumber()
    @Min(1)
    @IsNotEmpty()
    order: number;

    @ApiProperty({
        description: 'Whether the question is required to submit the quiz or survey',
        example: true,
    })
    @IsBoolean()
    @IsOptional()
    required: boolean = true; // default to true

    constructor(question: Question) {
        super();
        Object.assign(this, question);

        this.recordId = question.recordId || uuidv4();
        this.recordType = DatabaseKeys.QUESTION;
        this.createdAt = question.createdAt || getUTCDate().toISOString();
        this.updatedAt = question.updatedAt || getUTCDate().toISOString();

        if (question.options) {
            this.options = question.options.map((opt) => new AnswerOption(opt));
        }

        if (question.required === undefined) {
            this.required = true;
        }
    }
}
