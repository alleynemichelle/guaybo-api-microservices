import { Unit } from 'apps/libs/common/enums/unit.enum';
import { IsEnum, IsNumber, IsString } from 'class-validator';

export class ValueItem {
    @IsNumber()
    quantity: number;

    @IsEnum(Unit)
    unit: Unit;
}
