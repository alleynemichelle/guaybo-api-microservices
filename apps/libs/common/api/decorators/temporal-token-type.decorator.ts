import { SetMetadata } from '@nestjs/common';
import { TemporalTokenType } from 'apps/libs/common/enums/temporal-token-type.enum';

/**
 * Decorator to specify required temporal token type for an endpoint
 * Used in conjunction with TemporalTokenGuard
 * @param tokenType The required temporal token type
 */
export const RequireTemporalTokenType = (tokenType: TemporalTokenType) => SetMetadata('tokenType', tokenType);
