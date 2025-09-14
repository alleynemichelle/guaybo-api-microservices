import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsObject, IsEmail } from 'class-validator';

export class HandleChallengeDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'Challenge key',
        example: 'NewPasswordRequired',
        type: String,
    })
    challenge: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'Session token',
        example: 'AYABeCzh0Ud3ooYIEdxakUHYRXYAHQAB',
        type: String,
    })
    session: string;

    @IsNotEmpty()
    @IsObject()
    @ApiProperty({
        description: 'Session token',
        example: {
            username: 'a7dcbb78-3831-4293-9f93-4e7b5bbc4a6b',
            newPassword: 'Pass1234%',
        },
    })
    challengeResponse: Record<string, any>;
}
