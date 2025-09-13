import { Param } from '@nestjs/common';
import { ValidateParamPipe } from '../pipes/validate-param.pipe';

export const ValidatedParam = (property: string) => Param(property, ValidateParamPipe);
