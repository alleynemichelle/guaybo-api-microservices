import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { QuestionDto } from './question.dto';

export class CreateQuestionsDto {
    @ApiProperty({
        description: 'List of questions to create',
        type: [QuestionDto],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QuestionDto)
    @IsNotEmpty()
    questions: QuestionDto[];
}
