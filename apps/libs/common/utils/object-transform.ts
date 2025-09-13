/**
 * Converts a string from snake_case to camelCase
 * @param str String in snake_case format
 * @returns String in camelCase format
 */
const snakeToCamel = (str: string): string =>
    str.toLowerCase().replace(/([-_][a-z])/g, (group) => group.replace('-', '').replace('_', '').toUpperCase());

/**
 * Transforms all keys in an object from snake_case to camelCase recursively
 * @param obj Object to transform
 * @returns Transformed object with camelCase keys
 */
export const transformKeysToCamel = <T extends object>(obj: object): T => {
    if (Array.isArray(obj)) {
        return obj.map((v) => (v && typeof v === 'object' ? transformKeysToCamel(v) : v)) as unknown as T;
    }

    return Object.entries(obj).reduce(
        (acc, [key, value]) => {
            const newKey = snakeToCamel(key);
            acc[newKey] = value && typeof value === 'object' ? transformKeysToCamel(value) : value;
            return acc;
        },
        {} as { [key: string]: any },
    ) as T;
};
