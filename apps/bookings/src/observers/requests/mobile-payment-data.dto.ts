import { IsNotEmpty, IsString, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MobilePaymentDataDto {
    @ApiProperty({
        description: 'Phone number for mobile payment',
        example: '+584141234567',
    })
    @IsNotEmpty()
    @IsString()
    phoneNumber: string;

    @ApiProperty({
        description: 'Document ID for mobile payment',
        example: 'V12345678',
    })
    @IsNotEmpty()
    @IsString()
    documentId: string;

    @ApiProperty({
        description: 'Amount to be paid',
        example: 100.5,
    })
    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @ApiProperty({
        description: 'Date of the payment',
        example: '2024-03-21T10:30:00Z',
    })
    @IsNotEmpty()
    @IsDateString()
    date: string;
}
