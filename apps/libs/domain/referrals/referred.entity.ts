import { IsBoolean, IsDateString, IsNotEmpty, IsString } from 'class-validator';
import { Base } from '../common/base.entity';

export class Referred extends Base {
    @IsString()
    @IsNotEmpty()
    email: string;

    @IsBoolean()
    @IsNotEmpty()
    isHost: boolean;

    @IsString()
    @IsNotEmpty()
    utmSource: string;

    @IsDateString()
    @IsNotEmpty()
    createdAt: string;

    @IsString()
    @IsNotEmpty()
    referralCode: string;

    constructor(referred: Partial<Referred>) {
        super();
        Object.assign(this, referred);
    }
}
