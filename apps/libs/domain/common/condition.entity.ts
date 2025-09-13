import { ApiProperty } from '@nestjs/swagger';
import { Operator } from 'apps/libs/common/enums/operator.enum';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class Condition {
    @ApiProperty({
        description: 'The value to compare against',
        example: 100,
    })
    @IsNotEmpty()
    value: any;

    @ApiProperty({
        description: 'The operator used for the condition',
        enum: Operator,
        example: Operator.GREATER_THAN,
    })
    @IsEnum(Operator)
    operator: Operator;

    @ApiProperty({
        description: 'The attribute to which the condition applies',
        example: 'totalPrice',
    })
    @IsNotEmpty()
    @IsString()
    attribute: string;
}
