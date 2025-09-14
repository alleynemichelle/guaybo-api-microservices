import { Inject, Injectable } from '@nestjs/common';

import { IUsersAuth } from '../interfaces/users-auth.interface';
import { RefreshSessionResponseDataDto } from '../dto/responses/refresh-session-response.dto';

@Injectable()
export class RefreshTokenHandler {
    constructor(@Inject('AuthService') private readonly authService: IUsersAuth) {}

    async execute(refreshToken: string): Promise<RefreshSessionResponseDataDto> {
        return await this.authService.refreshToken(refreshToken);
    }
}
