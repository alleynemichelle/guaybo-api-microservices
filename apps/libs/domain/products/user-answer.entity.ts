import { ApiProperty } from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';
import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

import { Base } from '../common/base.entity';
import { DatabaseKeys } from 'apps/libs/common/enums/database-keys.enum';
import { getUTCDate } from 'apps/libs/common/utils/date';

export class UserAnswer extends Base {
    @ApiProperty({ description: 'ID of the user who provided the answer' })
    @IsString()
    @IsNotEmpty()
    userId: string;

    @ApiProperty({ description: 'ID of the product this answer belongs to' })
    @IsString()
    @IsNotEmpty()
    productId: string;

    @ApiProperty({ description: 'ID of the resource (quiz/survey) this answer belongs to' })
    @IsString()
    @IsNotEmpty()
    resourceId: string;

    @ApiProperty({ description: 'ID of the question being answered' })
    @IsString()
    @IsNotEmpty()
    questionId: string;

    @ApiProperty({ description: 'Array of selected answer IDs for multiple choice questions' })
    @IsArray()
    @IsString({ each: true })
    selectedOptionIds?: string[];

    @ApiProperty({ description: 'The text of the answer for open text questions' })
    @IsString()
    answerText?: string;

    @ApiProperty({ description: 'The rating value for rating questions' })
    @IsNumber()
    ratingValue?: number;

    constructor(answer: Partial<UserAnswer>) {
        super();
        Object.assign(this, answer);

        this.recordId = answer.recordId || uuidv4();
        this.recordType = DatabaseKeys.USER_ANSWER;
        this.createdAt = answer.createdAt || getUTCDate().toISOString();
        this.updatedAt = getUTCDate().toISOString();
    }
}
