import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CustomPageTheme {
    @ApiProperty({
        description: 'Primary color for the custom page theme',
        example: '#4F46E5',
    })
    @IsString()
    primary: string;
}

export class CustomPage {
    @ApiPropertyOptional({
        description: 'Title to be displayed on the checkout page',
        example: 'Complete Your Purchase',
    })
    @IsString()
    checkoutTitle?: string;

    @ApiPropertyOptional({
        description: 'Title to be displayed on the host page',
        example: 'Welcome, Host!',
    })
    @IsString()
    hostTitle?: string;

    @ApiPropertyOptional({
        description: 'Main title for the custom page',
        example: 'Welcome to Our Service',
    })
    @IsString()
    mainTitle?: string;

    @ApiProperty({
        description: 'Theme configuration for the custom page',
        type: CustomPageTheme,
    })
    @IsObject()
    @ValidateNested()
    @Type(() => CustomPageTheme)
    theme: CustomPageTheme;
}
