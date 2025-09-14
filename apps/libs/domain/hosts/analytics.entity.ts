import { IsEnum, IsObject, IsString } from 'class-validator';
import { Base } from '../common/base.entity';
import { Status } from 'apps/libs/common/enums/status.enum';

export class Analytics extends Base {
    @IsString()
    provider: string;

    @IsString()
    trackerId: string;

    @IsString()
    trackerName?: string;

    @IsEnum(Status)
    status: Status;

    @IsObject()
    configuration?: Record<string, any>;
}
