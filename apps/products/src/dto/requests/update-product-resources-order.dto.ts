import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResourceOrderItem {
    @ApiProperty({
        description: 'ID del recurso',
        example: '12345678-abcd-efgh-ijkl-123456789012',
    })
    @IsString()
    @IsNotEmpty()
    recordId: string;

    @ApiProperty({
        description: 'Nueva posición de orden del recurso',
        example: 1,
    })
    @IsNumber()
    @Min(1)
    order: number;

    @ApiProperty({
        description: 'ID del recurso padre (opcional)',
        example: '12345678-abcd-efgh-ijkl-123456789012',
        required: false,
    })
    @IsString()
    @IsOptional()
    parentId?: string;
}

export class UpdateProductResourcesOrderDto {
    @ApiProperty({
        description: 'Lista de recursos con su nuevo orden',
        type: [ResourceOrderItem],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ResourceOrderItem)
    resources: ResourceOrderItem[];
}
