import { ApiProperty } from '@nestjs/swagger';
import { ResponseDto } from 'apps/libs/api/response.entity';

class GuestProductDto {
    product: {
        recordId: string;
        name: string;
        alias: string;
        hostId: string;
        timezone: string;
        mainGallery: {
            path: string;
            source: string;
            id: string;
            type: string;
        }[];
        productType: string;
        location: {
            type: string;
        };
        description: string;
    };
    booking: {
        createdAt: string;
        bookingId: string;
    };
}

export class GetGuestProductResponse extends ResponseDto {
    @ApiProperty({
        description: 'Get product  response.',
        type: GuestProductDto,
        example: {
            product: {
                recordId: '190035f5-2332-45f3-bc49-ea54d72b9dbd',
                name: 'Reto Culinario: Sabores en 30 Minutos',
                alias: 'reto-culinario-sabores-en-30-minutos',
                hostId: '5bd5425c-911b-4e91-b59a-f10b6a085f20',
                timezone: 'America/Caracas',
                mainGallery: [
                    {
                        path: 'https://d2fl1cbggyckhd.cloudfront.net/public/hosts/5bd5425c-911b-4e91-b59a-f10b6a085f20/products/190035f5-2332-45f3-bc49-ea54d72b9dbd/GUAYBO - RETO CULINARIO-2.png',
                        source: 'APP',
                        id: '871e1a63-d3a0-4414-b08c-34d2bfd08646',
                        type: 'IMAGE',
                    },
                ],
                productType: 'EVENT',
                location: {
                    type: 'ONLINE',
                },
                description:
                    'Pon a prueba tu creatividad en la cocina preparando un platillo delicioso en solo 30 minutos con ingredientes sorpresa.',
            },
            booking: {
                createdAt: '2025-03-22T15:21:08.460Z',
                bookingId: '17426568684608684604020',
            },
        },
    })
    data: GuestProductDto;
}
