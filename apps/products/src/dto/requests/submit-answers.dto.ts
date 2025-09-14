import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class AnswerDto {
    @ApiProperty({
        description: 'ID of the question being answered',
        example: '1b512b0b-5f3b-4f8e-9ef7-1d730f3d1334',
    })
    @IsString()
    @IsNotEmpty()
    questionId: string;

    @ApiPropertyOptional({
        description: 'Array of selected answer IDs for multiple choice questions',
        example: ['b552445a-b895-47c7-b2f2-3b2b5ff6620e'],
    })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    selectedOptionIds?: string[];

    @ApiPropertyOptional({
        description: 'The text of the answer for open text questions',
        example: 'This is my suggestion.',
    })
    @IsString()
    @IsOptional()
    answerText?: string;

    @ApiPropertyOptional({
        description: 'The rating value for rating questions',
        example: 5,
    })
    @IsNumber()
    @IsOptional()
    ratingValue?: number;
}

export class SubmitAnswersDto {
    @ApiProperty({
        description: 'List of answers to submit',
        type: [AnswerDto],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AnswerDto)
    answers: AnswerDto[];
}
