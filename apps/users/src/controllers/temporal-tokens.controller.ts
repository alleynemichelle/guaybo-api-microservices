import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

import { ResponseDto } from 'apps/libs/common/api/response.entity';
import { SendTemporalTokenDto } from '../dto/requests/send-temporal-token.dto';
import { TemporalTokensService } from '../services/temporal-tokens.service';

/**
 * Controller for temporal tokens operations
 * Used for authentication flows with magic links
 */
@ApiTags('Temporal Tokens')
@Controller('v2/auth/temporal-tokens')
export class TemporalTokensController {
    constructor(private readonly temporalTokensService: TemporalTokensService) {}

    /**
     * Sends a temporal token via email after validation
     * For COMPLETE_REGISTRATION: validates user exists but is not fully registered
     */
    @Post()
    @ApiOperation({ summary: 'Send temporal token via email' })
    @ApiBody({ type: SendTemporalTokenDto })
    @ApiResponse({ status: 201, description: 'Temporal token sent successfully via email' })
    @ApiResponse({ status: 400, description: 'Bad request - User validation failed or email error' })
    async sendTemporalToken(@Body() sendDto: SendTemporalTokenDto): Promise<ResponseDto> {
        try {
            await this.temporalTokensService.sendTemporalToken(sendDto);

            return new ResponseDto('success', 201, 'Token temporal enviado exitosamente por correo', {});
        } catch (error: any) {
            throw new BadRequestException(error.message || 'Error enviando token temporal');
        }
    }
}
