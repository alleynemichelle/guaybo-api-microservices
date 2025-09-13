import { IsString } from 'class-validator';
import { PaymentPreview } from './payment-preview.entity';

export class Payment extends PaymentPreview {
    @IsString()
    receipt?: string;

    @IsString()
    paymentMethod?: string;
}
