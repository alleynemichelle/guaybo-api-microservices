import { addMonths, addWeeks } from 'date-fns';
import { Injectable } from '@nestjs/common';
import { Frequency } from 'apps/libs/common/enums/frequency.enum';
import { AmountType } from 'apps/libs/common/enums/amount-type.enum';
import { roundToHalfUp } from 'apps/libs/common/utils/amounts';
import { evaluateConditions } from 'apps/libs/common/utils/conditionals';
import { Installment } from 'apps/libs/entities/bookings/installment.entity';
import { InstallmentsProgram } from 'apps/libs/entities/bookings/installments-program.entity';

@Injectable()
export class InstallmentCalculationService {
    private calculateAdjustment(interestFee: { amount: number; type: AmountType }, amount: number): number {
        if (interestFee.type === AmountType.PERCENTAGE) {
            return (interestFee.amount / 100) * amount;
        }
        return interestFee.amount;
    }

    public calculateInstallmentsData(
        subtotal: number,
        finalAmount: number,
        installmentsProgram?: InstallmentsProgram,
        conditions?: Record<string, any>,
    ): {
        installments: Partial<Installment>[];
        installmentsInterestFee: number;
        installmentsProgramApplied: boolean;
        remainingAmount: number;
        finalAmountWithInterest: number;
    } {
        // Default response with no installments
        const defaultResponse = {
            installments: [],
            installmentsInterestFee: 0,
            installmentsProgramApplied: false,
            remainingAmount: 0,
            finalAmountWithInterest: finalAmount,
        };

        // Validate basic conditions
        if (!installmentsProgram || finalAmount <= 0 || !conditions?.applyInstallments) {
            return defaultResponse;
        }

        // Calculate interest fee
        const installmentsInterestFee = installmentsProgram.interestFee
            ? this.calculateAdjustment(installmentsProgram.interestFee, subtotal)
            : 0;

        // Update final amount with interest
        const finalAmountWithInterest = roundToHalfUp(finalAmount + installmentsInterestFee);

        // Check if installments should be applied based on program conditions
        const shouldApplyInstallments =
            !installmentsProgram.conditions?.length || evaluateConditions(installmentsProgram.conditions, conditions);

        if (!shouldApplyInstallments) {
            return {
                ...defaultResponse,
                installmentsInterestFee,
                finalAmountWithInterest,
            };
        }

        // Calculate installments
        const installments = this.calculateInstallments(finalAmountWithInterest, installmentsProgram);

        // Calculate remaining amount
        const remainingAmount = finalAmountWithInterest - (installments[0]?.amount || 0);

        return {
            installments,
            installmentsInterestFee: roundToHalfUp(installmentsInterestFee),
            installmentsProgramApplied: true, // Solo llega aquí si applyInstallments es true y las condiciones se cumplen
            remainingAmount: roundToHalfUp(remainingAmount),
            finalAmountWithInterest,
        };
    }

    private calculateInstallments(
        totalAmount: number,
        installmentsProgram: InstallmentsProgram,
    ): Partial<Installment>[] {
        const { installmentsCount, frequency } = installmentsProgram;
        const installmentAmount = roundToHalfUp(totalAmount / installmentsCount);

        return Array.from({ length: installmentsCount }, (_, index) => {
            const order = index + 1;
            const dueDate = this.calculateDueDate(new Date(), frequency, index);
            const amount =
                order === installmentsCount
                    ? roundToHalfUp(totalAmount - installmentAmount * (installmentsCount - 1))
                    : installmentAmount;

            return { amount, dueDate: dueDate.toISOString(), order };
        });
    }

    private calculateDueDate(startDate: Date, frequency: Frequency, installmentIndex: number): Date {
        switch (frequency) {
            case Frequency.WEEKLY:
                return addWeeks(startDate, installmentIndex);
            case Frequency.EVERY_TWO_WEEKS:
                return addWeeks(startDate, installmentIndex * 2);
            case Frequency.MONTHLY:
                return addMonths(startDate, installmentIndex);
            default:
                throw new Error('Unsupported payment frequency');
        }
    }
}
