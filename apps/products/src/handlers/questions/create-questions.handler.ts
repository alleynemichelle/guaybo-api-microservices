import { StandardAnswerKeys } from 'apps/libs/common/enums/standard-answer-keys.enum';
import { AnswerOption, Question, QuestionType } from 'apps/libs/entities/products/question.entity';
import { IProductsRepository } from 'apps/libs/repositories/products/products-repository.interface';

import { QuestionDto } from '../../dto/requests/question.dto';

export class CreateQuestionsHandler {
    constructor(private readonly productsRepository: IProductsRepository) {}

    async execute(productId: string, resourceId: string, questionsDto: QuestionDto[]): Promise<Question[]> {
        const questions = questionsDto.map((dto) => {
            const questionData = { ...dto, resourceId };

            if (dto.questionType === QuestionType.TRUE_FALSE) {
                // For TRUE_FALSE questions, auto-generate options and ignore any provided options.
                questionData.options = [
                    new AnswerOption({ text: StandardAnswerKeys.TRUE, isCorrect: true }),
                    new AnswerOption({ text: StandardAnswerKeys.FALSE, isCorrect: false }),
                ];
            } else if (dto.options) {
                // For other question types, use the provided options.
                questionData.options = dto.options.map((optDto) => new AnswerOption(optDto));
            }

            return new Question(questionData as any);
        });
        return this.productsRepository.createQuestions(productId, questions);
    }
}
