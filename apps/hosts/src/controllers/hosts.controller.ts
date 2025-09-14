import { Controller, Get } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ResponseDto } from 'apps/libs/common/api/response.entity';
import { ValidatedParam } from 'apps/libs/common/api/decorators/validated-param.decorator';
import { GetHostResponseDto } from '../dto/responses/get-host-response.dto';
import { GetHostHandler } from '../handlers/get-host.handler';

@ApiSecurity('api-key')
@Controller('v2/hosts')
export class HostsController {
    constructor(private readonly getHostHandler: GetHostHandler) {}

    @ApiTags('Hosts')
    @ApiOperation({ summary: 'Get a host by identifier' })
    @ApiOkResponse({
        description: 'Host retrieved successfully',
        type: GetHostResponseDto,
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @ApiParam({
        name: 'hostId',
        description: 'Host Identifier',
        type: 'string',
        example: '0220439a-d3ea-408b-b05a-5e2e5316325a',
    })
    @Get(':hostId')
    async getHost(@ValidatedParam('hostId') hostId: string): Promise<ResponseDto> {
        try {
            const data = await this.getHostHandler.execute(hostId, true);
            return new ResponseDto('success', 200, 'HostSuccessfullyRetrieved', data);
        } catch (error: any) {
            console.error('Error retrieving host:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }
}
