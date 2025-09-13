import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

/**
 * Entity that represents a survey configuration
 */
export class Survey {
    @ApiProperty({
        description: 'Indicates if the responses are anonymous',
        example: false,
    })
    @IsBoolean()
    @IsNotEmpty()
    isAnonymous: boolean;

    constructor(survey: Partial<Survey>) {
        Object.assign(this, survey);
    }
}
