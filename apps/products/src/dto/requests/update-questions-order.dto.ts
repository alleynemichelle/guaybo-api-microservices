import { IsArray, IsString } from 'class-validator';

export class UpdateQuestionsOrderDto {
    @IsArray()
    @IsString({ each: true })
    questionIds: string[];
}
