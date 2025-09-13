import { IsString, IsNotEmpty, IsNumberString } from 'class-validator';

export class PhoneNumber {
    @IsString()
    @IsNotEmpty()
    code: string;

    @IsNumberString()
    @IsNotEmpty()
    number: string;

    /**
     * Combines the code and number into a single string.
     * @param phoneNumber The PhoneNumber instance to extract data from.
     * @returns The concatenated phone number as a string.
     */
    static getFullNumber(phoneNumber: PhoneNumber): string {
        if (!phoneNumber) {
            return '';
        }

        return `${phoneNumber.code}${phoneNumber.number}`;
    }
}
