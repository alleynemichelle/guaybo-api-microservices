import { IsNotEmpty, Matches, IsArray, ValidateNested, IsOptional, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class TimeSlot {
    @IsNotEmpty()
    @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'start time must be in HH:mm format (24-hour)',
    })
    start: string;

    @IsNotEmpty()
    @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'end time must be in HH:mm format (24-hour)',
    })
    end: string;
}

export class WeeklyAvailability {
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TimeSlot)
    monday?: TimeSlot[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TimeSlot)
    tuesday?: TimeSlot[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TimeSlot)
    wednesday?: TimeSlot[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TimeSlot)
    thursday?: TimeSlot[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TimeSlot)
    friday?: TimeSlot[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TimeSlot)
    saturday?: TimeSlot[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TimeSlot)
    sunday?: TimeSlot[];
}
