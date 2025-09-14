import { Body, Controller, Delete, Get, Param, Patch, Post, HttpStatus } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiTags,
    ApiResponse,
    ApiBadRequestResponse,
    ApiParam,
    ApiBody,
} from '@nestjs/swagger';
import { ResponseDto } from 'apps/libs/api/response.entity';
import { Question } from 'apps/libs/entities/products/question.entity';
import { QuestionsService } from '../questions.service';
import { CreateQuestionsDto } from '../dto/requests/create-questions.dto';
import { UpdateQuestionDto } from '../dto/requests/update-question.dto';
import { UpdateQuestionsOrderDto } from '../dto/requests/update-questions-order.dto';

@ApiBearerAuth()
@ApiTags('Product Resources Questions')
@Controller('management/products/:hostId/:productId/resources/:resourceId/questions')
export class QuestionsController {
    constructor(private readonly questionsService: QuestionsService) {}

    @Post()
    @ApiOperation({ summary: 'Create questions for a quiz or survey' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Questions created successfully' })
    @ApiBadRequestResponse({ description: 'Bad Request' })
    @ApiParam({ name: 'hostId', required: true, description: 'Host ID' })
    @ApiParam({ name: 'productId', required: true, description: 'Product ID' })
    @ApiParam({ name: 'resourceId', required: true, description: 'Resource ID (Quiz or Survey)' })
    @ApiBody({ type: CreateQuestionsDto })
    async createQuestions(
        @Param('productId') productId: string,
        @Param('resourceId') resourceId: string,
        @Body() createQuestionsDto: CreateQuestionsDto,
    ): Promise<ResponseDto> {
        try {
            const data = await this.questionsService.createQuestions(
                productId,
                resourceId,
                createQuestionsDto.questions,
            );
            return new ResponseDto('success', HttpStatus.CREATED, 'QuestionsSuccessfullyCreated', data);
        } catch (error: any) {
            console.error('Error creating questions: ', error);
            return new ResponseDto('error', error.status || HttpStatus.INTERNAL_SERVER_ERROR, error.message, {});
        }
    }

    @Get()
    @ApiOperation({ summary: 'Get all questions for a quiz or survey' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Questions retrieved successfully', type: [Question] })
    @ApiBadRequestResponse({ description: 'Bad Request' })
    @ApiParam({ name: 'hostId', required: true, description: 'Host ID' })
    @ApiParam({ name: 'productId', required: true, description: 'Product ID' })
    @ApiParam({ name: 'resourceId', required: true, description: 'Resource ID (Quiz or Survey)' })
    async getQuestions(
        @Param('productId') productId: string,
        @Param('resourceId') resourceId: string,
    ): Promise<ResponseDto> {
        try {
            const data = await this.questionsService.getQuestions(productId, resourceId);
            return new ResponseDto('success', HttpStatus.OK, 'QuestionsSuccessfullyRetrieved', data);
        } catch (error: any) {
            console.error('Error retrieving questions: ', error);
            return new ResponseDto('error', error.status || HttpStatus.INTERNAL_SERVER_ERROR, error.message, {});
        }
    }

    @Patch('order')
    @ApiOperation({ summary: 'Update questions order' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Questions order updated successfully' })
    @ApiBadRequestResponse({ description: 'Bad Request' })
    @ApiParam({ name: 'hostId', required: true, description: 'Host ID' })
    @ApiParam({ name: 'productId', required: true, description: 'Product ID' })
    @ApiParam({ name: 'resourceId', required: true, description: 'Resource ID (Quiz or Survey)' })
    @ApiBody({ type: UpdateQuestionsOrderDto })
    async updateQuestionsOrder(
        @Param('productId') productId: string,
        @Param('resourceId') resourceId: string,
        @Body() updateQuestionsOrderDto: UpdateQuestionsOrderDto,
    ): Promise<ResponseDto> {
        try {
            await this.questionsService.updateQuestionsOrder(productId, resourceId, updateQuestionsOrderDto);
            return new ResponseDto('success', HttpStatus.OK, 'QuestionsOrderSuccessfullyUpdated', {});
        } catch (error: any) {
            console.error('Error updating questions order: ', error);
            return new ResponseDto('error', error.status || HttpStatus.INTERNAL_SERVER_ERROR, error.message, {});
        }
    }

    @Patch(':questionId')
    @ApiOperation({ summary: 'Update a question' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Question updated successfully' })
    @ApiBadRequestResponse({ description: 'Bad Request' })
    @ApiParam({ name: 'hostId', required: true, description: 'Host ID' })
    @ApiParam({ name: 'productId', required: true, description: 'Product ID' })
    @ApiParam({ name: 'resourceId', required: true, description: 'Resource ID (Quiz or Survey)' })
    @ApiParam({ name: 'questionId', required: true, description: 'Question ID' })
    @ApiBody({ type: UpdateQuestionDto })
    async updateQuestion(
        @Param('productId') productId: string,
        @Param('resourceId') resourceId: string,
        @Param('questionId') questionId: string,
        @Body() updateQuestionDto: UpdateQuestionDto,
    ): Promise<ResponseDto> {
        try {
            const data = await this.questionsService.updateQuestion(
                productId,
                resourceId,
                questionId,
                updateQuestionDto,
            );
            return new ResponseDto('success', HttpStatus.OK, 'QuestionSuccessfullyUpdated', data);
        } catch (error: any) {
            console.error('Error updating question: ', error);
            return new ResponseDto('error', error.status || HttpStatus.INTERNAL_SERVER_ERROR, error.message, {});
        }
    }

    @Delete(':questionId')
    @ApiOperation({ summary: 'Delete a question' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Question deleted successfully' })
    @ApiBadRequestResponse({ description: 'Bad Request' })
    @ApiParam({ name: 'hostId', required: true, description: 'Host ID' })
    @ApiParam({ name: 'productId', required: true, description: 'Product ID' })
    @ApiParam({ name: 'resourceId', required: true, description: 'Resource ID (Quiz or Survey)' })
    @ApiParam({ name: 'questionId', required: true, description: 'Question ID' })
    async deleteQuestion(
        @Param('productId') productId: string,
        @Param('resourceId') resourceId: string,
        @Param('questionId') questionId: string,
    ): Promise<ResponseDto> {
        try {
            await this.questionsService.deleteQuestion(productId, resourceId, questionId);
            return new ResponseDto('success', HttpStatus.OK, 'QuestionSuccessfullyDeleted', {});
        } catch (error: any) {
            console.error('Error deleting question: ', error);
            return new ResponseDto('error', error.status || HttpStatus.INTERNAL_SERVER_ERROR, error.message, {});
        }
    }
}
