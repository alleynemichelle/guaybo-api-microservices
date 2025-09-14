import { ApiProperty } from '@nestjs/swagger';
import { ResponseDto } from 'apps/libs/common/api/response.entity';

export class RefreshSessionResponseDataDto {
    tokenId: string;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export class RefreshSessionResponse extends ResponseDto {
    @ApiProperty({
        description: 'Refresh session response.',
        type: RefreshSessionResponseDataDto,
        example: {
            tokenId: 'e3fce3b2-bc59-4d61-8beb-17fe3829d571',
            accessToken: 'e3fce3b2-bc59-4d61-8beb-17fe3829d571',
            refreshToken: 'e3fce3b2-bc59-4d61-8beb-17fe3829d571',
            expiresIn: 86400,
        },
    })
    data: RefreshSessionResponseDataDto;
}
