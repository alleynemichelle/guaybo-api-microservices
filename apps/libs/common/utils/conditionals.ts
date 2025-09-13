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

export function evaluateCondition(attributeValue: any, operator: string, value: any): boolean {
    switch (operator) {
        case 'EQUALS':
            return Array.isArray(value) ? value.includes(attributeValue) : attributeValue === value;
        case 'NOT_EQUALS':
            return Array.isArray(value) ? !value.includes(attributeValue) : attributeValue !== value;
        case 'GREATER_THAN':
            return attributeValue > value;
        case 'LESS_THAN':
            return attributeValue < value;
        default:
            return false;
    }
}

// Helper to evaluate discount conditions
export const evaluateConditions = (conditions: any[], data: any): boolean => {
    if (!conditions) conditions = [];
    return conditions.every((condition) => {
        const { attribute, operator, value } = condition;
        const attributeValue = getNestedValue(data, attribute);
        return evaluateCondition(attributeValue, operator, value);
    });
};
