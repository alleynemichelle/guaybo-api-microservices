import { IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProductResourceProgressDto {
    @ApiProperty({
        description: 'Indicates if the resource is completed',
        example: true,
    })
    @IsBoolean()
    @IsNotEmpty()
    completed: boolean;
}
