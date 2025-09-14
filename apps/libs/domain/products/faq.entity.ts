import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';

export class FAQ {
    @ApiProperty({
        description: 'The question for the FAQ',
        example: 'What is the cancellation policy?',
    })
    @IsString()
    question: string;

    @ApiProperty({
        description: 'The answer to the FAQ question',
        example: 'You can cancel your booking up to 24 hours before the event for a full refund.',
    })
    @IsString()
    answer: string;

    @ApiProperty({
        description: 'The order in which the FAQ should be displayed',
        example: 1,
    })
    @IsNumber()
    order: number;
}
