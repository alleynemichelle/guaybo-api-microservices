import { ApiProperty } from '@nestjs/swagger';
import { ResponseDto } from 'apps/libs/common/api/response.entity';
import { GetHostResponseDto } from './get-host-response.dto';

export class CreateHostResponseDataDto {
    @ApiProperty({ example: 'e3fce3b2-bc59-4d61-8beb-17fe3829d571' })
    recordId: string;

    @ApiProperty({ example: 'Guaybo Productions' })
    name: string;

    @ApiProperty({ example: 'guaybo-productions' })
    alias: string;

    @ApiProperty({ example: 'contact@guaybo.com' })
    email: string;

    @ApiProperty({ example: 'ACTIVE' })
    status: string;

    @ApiProperty({ example: 'America/Caracas' })
    timezone: string;

    @ApiProperty({ example: '2024-09-06T01:28:42.181Z' })
    createdAt: string;
}

export class CreateHostResponseDto extends ResponseDto {
    @ApiProperty({
        type: GetHostResponseDto,
        example: {
            recordId: 'e3fce3b2-bc59-4d61-8beb-17fe3829d571',
            name: 'Guaybo Productions',
            alias: 'guaybo-productions',
            email: 'contact@guaybo.com',
            status: 'ACTIVE',
            timezone: 'America/Caracas',
            createdAt: '2024-09-06T01:28:42.181Z',
        },
    })
    data: GetHostResponseDto;
}
