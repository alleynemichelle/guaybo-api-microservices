import { IsArray, ValidateNested } from 'class-validator';
import { Base } from '../common/base.entity';
import { Type } from 'class-transformer';
import { LabelValue } from '../common/label-value.entity';

class ServiceDto extends LabelValue {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => LabelValue)
    plans: LabelValue[];
}

export class Filter extends Base {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => LabelValue)
    paymentMethods: LabelValue[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => LabelValue)
    paymentMode: LabelValue[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => LabelValue)
    paymentStatus: LabelValue[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ServiceDto)
    services: ServiceDto[];
}
