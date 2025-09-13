import { AmountType } from '../enums/amount-type.enum';

export function calculateAdjustment(modifier: { type: AmountType; amount: number }, amount: number): number {
    if (modifier.type === AmountType.FIXED) {
        return modifier.amount;
    } else if (modifier.type === 'PERCENTAGE') {
        return (amount * modifier.amount) / 100;
    }
    return 0;
}

// Retrieves the value of a nested attribute from an object
export function getNestedValue(obj: any, path: string): any {
    const keys = path.split('.');
    let value = obj;

    for (const key of keys) {
        if (Array.isArray(value)) {
            value = value.map((item) => getNestedValue(item, key));
        } else if (value !== undefined) {
            value = value[key];
        } else {
            return undefined;
        }
    }

    return value;
}

// Evaluates whether a condition is met based on the operator
export function evaluateCondition(attributeValue: any, operator: string, value: any): boolean {
    switch (operator) {
        case 'EQUALS':
            return attributeValue === value;
        case 'GREATER_THAN':
            return attributeValue > value;
        case 'LESS_THAN':
            return attributeValue < value;
        default:
            return false;
    }
}

export function getStartAndEndDates(isoDate: string): { startBillingDate: string; closingBillingDate: string } {
    const date = new Date(isoDate);
    return {
        startBillingDate: new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)).toISOString(),
        closingBillingDate: new Date(
            Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0, 23, 59, 59, 999),
        ).toISOString(),
    };
}
