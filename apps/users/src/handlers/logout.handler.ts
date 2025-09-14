import { Inject, Injectable } from '@nestjs/common';
import { IUsersAuth } from '../interfaces/users-auth.interface';

@Injectable()
export class LogoutHandler {
    constructor(@Inject('AuthService') private readonly authService: IUsersAuth) {}

    async execute(token: string): Promise<void> {
        return await this.authService.logout(token);
    }
}
