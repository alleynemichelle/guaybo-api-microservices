import { ApiProperty } from '@nestjs/swagger';
import { ResponseDto } from 'apps/libs/api/response.entity';
import { MultimediaSource } from 'apps/libs/common/enums/multimedia-source.enum';
import { MultimediaType } from 'apps/libs/common/enums/multimedia-type.enum';
import { ProductResourcesWithMetricsResponse } from '../dto/responses/get-product-resources.response';

export class GetPublicResourcesResponse extends ResponseDto {
    @ApiProperty({
        description: 'Estado de la respuesta',
        example: 'success',
    })
    status: string;

    @ApiProperty({
        description: 'Mensaje descriptivo',
        example: 'ProductResourcesSuccessfullyRetrieved',
    })
    message: string;

    @ApiProperty({
        description: 'Datos obtenidos (solo recursos con preview=true)',
        type: ProductResourcesWithMetricsResponse,
        example: {
            metrics: {
                totalDuration: 120,
                totalSections: 5,
                totalResources: 10,
                totalSize: 100,
            },
            resources: [
                {
                    recordId: '12345678-abcd-efgh-ijkl-123456789012',
                    type: 'RESOURCE',
                    title: 'Introducción al curso',
                    order: 1,
                    url: 'https://example.com/video.mp4',
                    thumbnail: {
                        type: MultimediaType.IMAGE,
                        source: MultimediaSource.APP,
                        path: 'https://cdn.guaybo.public/hosts/12345678-abcd-efgh-ijkl-123456789012/products/thumbnails/thumbnail.jpg',
                    },
                },
            ],
        },
    })
    data: ProductResourcesWithMetricsResponse;

    constructor(status: string, statusCode: number, message: string, data: ProductResourcesWithMetricsResponse) {
        super(status, statusCode, message, data);
        this.status = status;
        this.message = message;
        this.data = data;
    }
}
