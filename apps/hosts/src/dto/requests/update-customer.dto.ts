import { IsArray, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCustomerDto {
    @ApiProperty({
        description: 'Custom tags for the customer.',
        example: [
            {
                color: '#def7ec',
                value: 'activo',
            },
        ],
    })
    @IsArray()
    @IsNotEmpty()
    tags: {
        color: string;
        value: string;
    }[];
}
