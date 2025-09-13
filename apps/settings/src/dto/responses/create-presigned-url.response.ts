import { ApiProperty } from '@nestjs/swagger';
import { ResponseDto } from 'apps/libs/common/api/response.entity';

export class CreatePresignedUrlResponse extends ResponseDto {
    @ApiProperty({
        description: 'Create presigned url response.',
        example: {
            url: 'https://dev-guaybo-main-bucket.s3.us-east-1.amazonaws.com/private/services/ee684c1d-fa55-4c93-8a8c-05712e5e9d72/payments/2024-11-15/comprobante.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIA4MTWJKNQPSRXNHNS%2F20241116%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20241116T013413Z&X-Amz-Expires=3600&X-Amz-Signature=7252522d4c38ebb9f219807a15fe53433798587a0ee6110fbce61fffe0e61b31&X-Amz-SignedHeaders=host&x-id=PutObject',
        },
    })
    data: { url: string };
}
