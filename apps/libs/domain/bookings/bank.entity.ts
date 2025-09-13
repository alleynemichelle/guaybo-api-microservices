import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class Bank {
    @ApiProperty({
        description: 'Key of the bank',
        example: 'BANCO_DE_VENEZUELA',
    })
    @IsString()
    @IsNotEmpty()
    key: string;

    @ApiProperty({
        description: 'Name of the bank',
        example: 'Banco de Venezuela',
    })
    @IsString()
    @IsNotEmpty()
    name: string;
}
