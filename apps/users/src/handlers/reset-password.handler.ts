import { Inject, Injectable } from '@nestjs/common';
import { IUsersAuth } from '../interfaces/users-auth.interface';
import { ResetPasswordDto } from '../dto/requests/reset-password.dto';

@Injectable()
export class ResetPasswordHandler {
    constructor(@Inject('AuthService') private readonly authService: IUsersAuth) {}

    async execute(email: string, data: ResetPasswordDto): Promise<void> {
        return await this.authService.resetPassword(data.code, data.newPassword, email);
    }
}
