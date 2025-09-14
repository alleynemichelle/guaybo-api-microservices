import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    ForbiddenException,
    Get,
    Param,
    Patch,
    Post,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBody,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiSecurity,
    ApiTags,
} from '@nestjs/swagger';
import { ResponseDto } from 'apps/libs/common/api/response.entity';
import { TemporalTokenGuard } from 'apps/libs/common/api/guards/temporal-token-v2.guard';
import { TemporalTokenType } from 'apps/libs/common/enums/temporal-token-type.enum';
import { CodeEnum } from 'apps/libs/common/enums/auth.enum';
import { UsersErrorCodes } from 'apps/libs/common/constants/error-codes.constant';
import { JwtAuthGuard } from 'apps/libs/common/api/guards/jwt-auth.guard';
import { ValidatedParam } from 'apps/libs/common/api/decorators/validated-param.decorator';

import { CreateUserDto } from '../dto/requests/create-user.dto';
import { CreateUserResponseDataDto, CreateUserResponseDto } from '../dto/responses/create-user-response.dto';
import { CreateUserHandler } from '../handlers/create-user.handler';
import { SendCodeDto } from '../dto/requests/send-code.dto';
import { CreateUserProfileHandler } from '../handlers/create-user-profile.handler';
import { ConfirmAccountHandler } from '../handlers/confirm-account.handler';
import { GetUserHandler } from '../handlers/get-user.handler';
import { UpdateUserHandler } from '../handlers/update-user.handler';
import { CreateSessionHandler } from '../handlers/create-session.handler';
import { SendConfirmationCodeHandler } from '../handlers/send-confirmation-code.handler';
import { RecoverPasswordHandler } from '../handlers/recover-password.handler';
import { ConfirmAccountDto } from '../dto/requests/confirm-acount.dto';

import { UpdateCredentialsDto } from '../dto/requests/update-credentials.dto';
import { ChangePasswordHandler } from '../handlers/change-password.handler';
import { ResetPasswordHandler } from '../handlers/reset-password.handler';
import { UserResponseDto } from '../dto/responses/user-response.dto';
import { CreateUserProfileDto } from '../dto/requests/create-user-profile.dto';
import { UpdateUserDto } from '../dto/requests/update-user.dto';
import { CreateSessionDto } from '../dto/requests/create-session.dto';
import { CreateSessionResponseDto, RequiredAuthActionResponse } from '../dto/responses/create-session-response.dto';
import { CreateFederatedSessionHandler } from '../handlers/create-federated-session.handler';
import { CreateFederatedSessionDto } from '../dto/requests/create-federated-session.dto';
import { RefreshTokenDto } from '../dto/requests/refresh-token.dto';
import { RefreshSessionResponse } from '../dto/responses/refresh-session-response.dto';
import { RefreshTokenHandler } from '../handlers/refresh-token.handler';
import { LogOutDto } from '../dto/requests/log-out.dto';
import { LogoutHandler } from '../handlers/logout.handler';
import { CompleteRegistrationDto } from '../dto/requests/complete-registration.dto';

import { CompleteRegistrationHandler } from '../handlers/complete-registration.handler';
import { CurrentUser, UserData } from 'apps/libs/common/api/decorators/user.decorator';
import { RequireTemporalTokenType } from 'apps/libs/common/api/decorators/temporal-token-type.decorator';
import { TemporalToken } from 'apps/libs/common/api/decorators/temporal-token.decorator';
import { UserId } from 'apps/libs/common/api/decorators/user-id.decorator';

@ApiSecurity('api-key')
@Controller('v2/users')
export class UsersController {
    constructor(
        private readonly createUserHandler: CreateUserHandler,
        private readonly confirmAccountHandler: ConfirmAccountHandler,
        private readonly sendConfirmationCodeHandler: SendConfirmationCodeHandler,
        private readonly recoverPasswordHandler: RecoverPasswordHandler,
        private readonly createUserProfileHandler: CreateUserProfileHandler,
        private readonly getUserHandler: GetUserHandler,
        private readonly updateUserHandler: UpdateUserHandler,
        private readonly createSessionHandler: CreateSessionHandler,
        private readonly createFederatedSessionHandler: CreateFederatedSessionHandler,
        private readonly completeRegistrationHandler: CompleteRegistrationHandler,
        private readonly changePasswordHandler: ChangePasswordHandler,
        private readonly resetPasswordHandler: ResetPasswordHandler,
        private readonly refreshTokenHandler: RefreshTokenHandler,
        private readonly logoutHandler: LogoutHandler,
    ) {}

    @ApiTags('Users')
    @ApiOperation({ summary: 'Create a new user' })
    @ApiBody({ type: CreateUserDto })
    @ApiOkResponse({
        description: 'User created successfully',
        type: CreateUserResponseDto,
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @Post()
    async createUser(@Body() createUserDto: CreateUserDto): Promise<ResponseDto> {
        console.log('Starting user creation process');
        try {
            const data = await this.createUserHandler.execute(createUserDto);
            return new ResponseDto('success', 201, 'UserCreatedSuccessfully', data);
        } catch (error: any) {
            console.error('Error creating user:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiTags('Users')
    @ApiOperation({ summary: 'Send code to user email' })
    @ApiOkResponse({
        description: 'Code sent successfully',
        type: ResponseDto,
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @ApiBody({ type: SendCodeDto })
    @Post('codes')
    async sendCode(@Body() sendCodeDto: SendCodeDto): Promise<ResponseDto> {
        console.log('Starting confirmation code process');

        try {
            if (sendCodeDto.type == CodeEnum.CONFIRM_ACCOUNT)
                await this.sendConfirmationCodeHandler.execute(sendCodeDto.email, sendCodeDto.redirectType);
            else if (sendCodeDto.type == CodeEnum.RECOVER_PASSWORD)
                await this.recoverPasswordHandler.execute(sendCodeDto.email, sendCodeDto.redirectType);
            else return new ResponseDto('error', 400, UsersErrorCodes.InvalidCodeType, {});

            return new ResponseDto('success', 201, 'CodeSentSuccessfully', {});
        } catch (error: any) {
            console.error('Error resending confirmation code:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiTags('Users')
    @ApiSecurity('token-id')
    @ApiOperation({ summary: 'Confirm user account' })
    @ApiBody({ type: ConfirmAccountDto })
    @ApiParam({
        name: 'userId',
        description: 'User Identifier',
        type: 'string',
        example: '21a0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a',
    })
    @ApiOkResponse({
        description: 'Account confirmed successfully',
        type: ResponseDto,
    })
    @ApiBadRequestResponse({ description: 'InvalidInput' })
    @UseGuards(JwtAuthGuard)
    @Post(':userId/verifications')
    async confirmAccount(
        @CurrentUser() currentUser: UserData,
        @ValidatedParam('userId') userId: string,
        @Body() confirmAccountDto: ConfirmAccountDto,
    ): Promise<ResponseDto> {
        console.log('Starting confirm account process ');

        try {
            const data = await this.confirmAccountHandler.execute(currentUser, confirmAccountDto);
            return new ResponseDto('success', 201, 'AccountConfirmedSuccessfully', data);
        } catch (error: any) {
            console.error('Error confirming account:', error);

            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiTags('Users')
    @ApiOperation({
        summary: 'Update user credentials',
    })
    @ApiBody({ type: UpdateCredentialsDto })
    @ApiOkResponse({
        description: 'Update password successfully',
        type: ResponseDto,
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @Patch('credentials')
    async updateCredentials(@Body() updateCredentialsDto: UpdateCredentialsDto): Promise<ResponseDto> {
        console.log('Starting update credentials process ');
        try {
            if (updateCredentialsDto.changePassword)
                await this.changePasswordHandler.execute(updateCredentialsDto.changePassword);
            else if (updateCredentialsDto.resetPassword)
                await this.resetPasswordHandler.execute(updateCredentialsDto.email, updateCredentialsDto.resetPassword);
            else throw new BadRequestException(UsersErrorCodes.InvalidCredentials);

            return new ResponseDto('success', 200, 'PasswordChangedSuccessfully', {});
        } catch (error: any) {
            console.error('Error updating credentials:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiTags('User profiles')
    @ApiSecurity('token-id')
    @ApiOperation({ summary: 'Create a new user profile' })
    @ApiBody({ type: CreateUserDto })
    @ApiOkResponse({
        description: 'User created successfully',
        type: UserResponseDto,
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @UseGuards(JwtAuthGuard)
    @Post('profiles')
    async createUserProfile(
        @Body() createUserProfileDto: CreateUserProfileDto,
        @CurrentUser() user: UserData,
    ): Promise<ResponseDto> {
        console.log('Starting user profile creation process');
        try {
            const data = await this.createUserProfileHandler.execute(
                user.sub as string,
                user.email,
                createUserProfileDto,
            );
            return new ResponseDto('success', 201, 'UserCreatedSuccessfully', data);
        } catch (error: any) {
            console.error('Error creating user:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiTags('User profiles')
    @ApiSecurity('token-id')
    @ApiOperation({
        summary: 'Get user data',
    })
    @ApiParam({
        name: 'userId',
        description: 'User Identifier',
        type: 'string',
        example: '21a0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a',
    })
    @ApiOkResponse({
        description: 'User data retrieved successfully',
        type: UserResponseDto,
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @UseGuards(JwtAuthGuard)
    @Get('profiles/:userId')
    async getUser(@Param('userId') userId: string, @CurrentUser() user: UserData): Promise<ResponseDto> {
        console.log('Starting get user data process');

        try {
            if (userId !== user.id) {
                throw new ForbiddenException(UsersErrorCodes.Unauthorized);
            }

            const data = await this.getUserHandler.execute(userId);
            return new ResponseDto('success', 200, 'UserDataRetrievedSuccessfully', data);
        } catch (error: any) {
            console.error('Error getting user data:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiTags('User profiles')
    @ApiSecurity('token-id')
    @ApiOperation({
        summary: 'Update user basic information',
    })
    @ApiParam({
        name: 'userId',
        description: 'User Identifier',
        type: 'string',
        example: '21a0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a',
    })
    @ApiBody({ type: UpdateUserDto })
    @ApiOkResponse({
        description: 'User information updated successfully',
        type: UserResponseDto,
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @UseGuards(JwtAuthGuard)
    @Patch('profiles/:userId')
    async updateUserProfile(
        @Param('userId') userId: string,
        @Body() updateUserDto: UpdateUserDto,
        @CurrentUser() user: UserData,
    ): Promise<ResponseDto> {
        console.log('Starting update user basic info process');
        try {
            if (userId !== user.id) throw new ForbiddenException(UsersErrorCodes.Unauthorized);

            const data = await this.updateUserHandler.execute(userId, updateUserDto);
            return new ResponseDto('success', 200, 'UserUpdatedSuccessfully', data);
        } catch (error: any) {
            console.error('Error updating user info:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiTags('Sessions')
    @ApiOperation({ summary: 'Authenticate user' })
    @ApiBody({ type: CreateSessionDto })
    @ApiResponse({
        status: 201,
        description: 'User logged in successfully',
        type: CreateSessionResponseDto,
    })
    @ApiResponse({
        status: 203,
        description: 'Auth action is required',
        type: RequiredAuthActionResponse,
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @Post('sessions')
    async login(@Body() loginDto: CreateSessionDto): Promise<ResponseDto> {
        try {
            const data = await this.createSessionHandler.execute(loginDto);
            return new ResponseDto('success', 201, 'SessionCreatedSuccessfully', data);
        } catch (error: any) {
            console.error('Error logging user:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiTags('Sessions')
    @ApiOperation({ summary: 'Authenticate federated users' })
    @ApiBody({ type: CreateFederatedSessionDto })
    @ApiResponse({
        status: 201,
        description: 'User logged in successfully',
        type: CreateSessionResponseDto,
    })
    @ApiResponse({
        status: 203,
        description: 'Auth action is required',
        type: RequiredAuthActionResponse,
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @Post('sessions/providers')
    async federatedLogin(@Body() loginDto: CreateFederatedSessionDto): Promise<ResponseDto> {
        console.log('Starting federated login process ');

        try {
            const data = await this.createFederatedSessionHandler.execute(loginDto);
            return new ResponseDto('success', 201, 'SessionCreatedSuccessfully', data);
        } catch (error: any) {
            console.error('Error logging user:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiTags('Sessions')
    @ApiSecurity('token-id')
    @ApiOperation({ summary: 'Refresh access tokens' })
    @ApiParam({
        name: 'userId',
        description: 'User ID',
        type: 'string',
        example: '3434d390-7ace-46bd-9251-9d5da01ac293',
    })
    @ApiBody({ type: RefreshTokenDto })
    @ApiOkResponse({
        description: 'Token refreshed successfully',
        type: RefreshSessionResponse,
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @UseGuards(JwtAuthGuard)
    @Patch('sessions/:userId')
    async refreshToken(@Body() refreshToken: RefreshTokenDto): Promise<ResponseDto> {
        console.log('Starting refresh token process ');

        try {
            const data = await this.refreshTokenHandler.execute(refreshToken.refreshToken);
            return new ResponseDto('success', 200, 'TokenUpdatedSuccessfully', data);
        } catch (error: any) {
            console.error('Error refreshing token:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiTags('Sessions')
    @ApiSecurity('token-id')
    @ApiOperation({
        summary: 'Delete user session',
    })
    @ApiParam({
        name: 'userId',
        description: 'User ID',
        type: 'string',
        example: '3434d390-7ace-46bd-9251-9d5da01ac293',
    })
    @ApiBody({ type: LogOutDto })
    @ApiOkResponse({
        description: 'Log out successfully',
        type: ResponseDto,
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @UseGuards(JwtAuthGuard)
    @Delete('sessions/:userId')
    async logout(@Body() logoutDto: LogOutDto): Promise<ResponseDto> {
        console.log('Starting logout process');
        try {
            await this.logoutHandler.execute(logoutDto.accessToken);
            return new ResponseDto('success', 201, 'SessionDeletedSuccessfully', {});
        } catch (error: any) {
            console.error('Error logging out:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    @ApiTags('Users')
    @ApiOperation({
        summary: 'Complete user registration using temporal token',
        description:
            'Completes user registration by creating user in Cognito and returning session. User must exist in database.',
    })
    @ApiBody({ type: CompleteRegistrationDto })
    @ApiOkResponse({
        description: 'Registration completed successfully',
        type: CreateUserResponseDataDto,
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @UseGuards(TemporalTokenGuard)
    @RequireTemporalTokenType(TemporalTokenType.COMPLETE_REGISTRATION)
    @Post('complete-registration')
    async completeRegistration(
        @Body() completeRegistrationDto: CompleteRegistrationDto,
        @CurrentUser() user: UserData,
        @TemporalToken()
        temporalToken: [
            string,
            {
                internalTokenId: string;
                tokenId: number;
                isValid: boolean;
                tokenType: TemporalTokenType;
                userId: string;
                email: string;
                redirectUrl: string;
            },
        ],
    ): Promise<ResponseDto> {
        console.log('Starting complete registration process');
        try {
            const [, temporalTokenPayload] = temporalToken;
            const data = await this.completeRegistrationHandler.execute(
                user.userId,
                completeRegistrationDto.password,
                temporalTokenPayload.tokenId,
            );
            return new ResponseDto('success', 201, 'RegistrationCompletedSuccessfully', data);
        } catch (error: any) {
            console.error('Error completing registration:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }

    /*
    / TODO: CHECK THIS ENDPOINT BECAUSE IT SEEMS DUPLICATED
    */
    @ApiTags('Users')
    @ApiOperation({
        summary: 'Update user basic information',
    })
    @ApiParam({
        name: 'userId',
        description: 'User Identifier',
        type: 'string',
        example: '21a0f4d7-6b70-4e2f-8bec-72d8cbc7aa3a',
    })
    @ApiBody({ type: UpdateUserDto })
    @ApiOkResponse({
        description: 'User information updated successfully',
        type: ResponseDto,
    })
    @ApiBadRequestResponse({ description: 'BadRequest' })
    @UseGuards(JwtAuthGuard)
    @Patch(':userId')
    async updateUser(
        @ValidatedParam('userId') userId: string,
        @UserId() userIdFromDecorator: string,
        @Body() updateUserDto: UpdateUserDto,
    ): Promise<ResponseDto> {
        console.log('Starting update user basic info process');
        try {
            if (userId !== userIdFromDecorator) {
                throw new UnauthorizedException(UsersErrorCodes.Unauthorized);
            }

            const data = await this.updateUserHandler.execute(userId, updateUserDto);
            return new ResponseDto('success', 200, 'UserUpdatedSuccessfully', data);
        } catch (error: any) {
            console.error('Error updating user info:', error);
            return new ResponseDto('error', error.status || 500, error.message || 'OperationFailed', {});
        }
    }
}
