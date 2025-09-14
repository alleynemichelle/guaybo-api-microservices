import { ApiProperty } from '@nestjs/swagger';
import { AuthRedirectType, CodeEnum } from 'apps/libs/common/enums/auth.enum';
import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class SendCodeDto {
    @IsNotEmpty()
    @IsEmail()
    @Transform(({ value }) => value.toLowerCase())
    @ApiProperty({
        description: 'Email address of the user',
        example: 'john.doe@example.com',
        type: String,
    })
    email: string;

    @IsNotEmpty()
    @IsEnum(CodeEnum, { each: true })
    @ApiProperty({
        description: 'Type of the code to send. Possible values: RECOVER_PASSWORD',
        example: 'RECOVER_PASSWORD',
        type: String,
        enum: CodeEnum,
        default: 'RECOVER_PASSWORD',
    })
    type: CodeEnum;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'Redirect type',
        example: 'ADMIN_REDIRECT',
        type: String,
        enum: AuthRedirectType,
    })
    redirectType: AuthRedirectType;
}
