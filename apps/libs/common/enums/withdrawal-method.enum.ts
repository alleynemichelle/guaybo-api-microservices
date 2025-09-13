export enum WithdrawalMethod {
    VENEZUELAN_BANK_ACCOUNT = 'VENEZUELAN_BANK_ACCOUNT',
}

export const WithdrawalMethodDefinition = {
    [WithdrawalMethod.VENEZUELAN_BANK_ACCOUNT]: {
        key: 'VENEZUELAN_BANK_ACCOUNT',
        name: 'Cuenta Bancaria Venezolana',
        currency: 'VES',
        requiresIdentity: true,
    },
};
