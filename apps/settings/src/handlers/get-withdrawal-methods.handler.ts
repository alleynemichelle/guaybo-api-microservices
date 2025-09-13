import { WithdrawalMethodDefinition } from 'apps/libs/common/enums/withdrawal-method.enum';
import { Injectable } from '@nestjs/common';
import { WithdrawalMethodResponseDto } from '../dto/responses/withdrawal-method-response.dto';

@Injectable()
export class GetWithdrawalMethodsHandler {
    constructor() {}

    async execute(): Promise<WithdrawalMethodResponseDto[]> {
        try {
            return Object.values(WithdrawalMethodDefinition);
        } catch (error: any) {
            console.error('Error retrieving withdrawal methods: ', error);
            throw error;
        }
    }
}
