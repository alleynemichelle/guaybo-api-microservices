import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ResponseDto } from '../response.entity';

@Injectable()
export class ValidateParamPipe implements PipeTransform {
    transform(value: any) {
        if (value === 'undefined' || value === undefined || value === null) {
            const response = new ResponseDto('error', 400, 'InvalidParameter', {});
            throw new BadRequestException(response);
        }
        return value;
    }
}
