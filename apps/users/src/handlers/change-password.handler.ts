import { Inject } from '@nestjs/common';
import { Injectable } from '@nestjs/common';

import { ChangePasswordDto } from '../dto/requests/change-password.dto';
import { IUsersAuth } from '../interfaces/users-auth.interface';

@Injectable()
export class ChangePasswordHandler {
    constructor(@Inject('AuthService') private readonly authService: IUsersAuth) {}

    async execute(data: ChangePasswordDto): Promise<void> {
        await this.authService.changePassword(data.oldPassword, data.newPassword, data.accessToken);
    }
}
