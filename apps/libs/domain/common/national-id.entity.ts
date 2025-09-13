import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

export enum NationalIdType {
    V = 'V', // Venezolano
    J = 'J', // Jurídico (empresa)
    E = 'E', // Extranjero
    P = 'P', // Pasaporte
}

export class NationalId {
    @IsEnum(NationalIdType)
    @IsNotEmpty()
    type: NationalIdType;

    @IsString()
    @IsNotEmpty()
    number: string;

    /**
     * Combines the type and number into a single string.
     * @param nationalId The NationalId instance to extract data from.
     * @returns The concatenated national ID as a string (e.g., "V12345678").
     */
    static getFullId(nationalId: NationalId): string {
        if (!nationalId) {
            return '';
        }

        return `${nationalId.type}${nationalId.number}`;
    }
}
