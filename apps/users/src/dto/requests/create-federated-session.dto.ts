import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsTimeZone } from 'class-validator';

export class CreateFederatedSessionDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'Code required to get session credentials',
        example: '655c65da-71ff-49f9-a805-5183756b98b0',
        type: String,
    })
    code: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'Login redirect URL',
        example: 'https://app.guaybo.com/authentication/login',
        type: String,
    })
    redirectUrl: string;

    @ApiProperty({
        description: 'Timezone of the user.',
        example: 'America/Caracas',
        type: String,
    })
    @IsTimeZone()
    timezone: string;
}
