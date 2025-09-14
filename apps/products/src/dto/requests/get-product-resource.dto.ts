import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { ContentMode } from 'apps/libs/common/enums/content-mode.enum';

export class GetProductResourceDto {
    @ApiPropertyOptional({
        enum: ContentMode,
        description: 'Content mode for the resource',
        example: ContentMode.INLINE,
        default: ContentMode.INLINE,
    })
    @IsEnum(ContentMode)
    @IsOptional()
    contentMode?: ContentMode = ContentMode.INLINE;
}
