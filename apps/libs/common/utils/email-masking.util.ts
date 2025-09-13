/**
 * Masks an email address by replacing part of the local part with asterisks
 * @param email The email address to mask
 * @returns The masked email address
 * @example maskEmail('user@example.com') => 'us**@example.com'
 * @example maskEmail('verylongemail@example.com') => 'very****@example.com'
 */
export function maskEmail(email: string): string {
    if (!email || !email.includes('@')) {
        return email;
    }

    const [localPart, domain] = email.split('@');

    if (localPart.length <= 2) {
        // For very short local parts, mask the last character
        return `${localPart.slice(0, -1)}*@${domain}`;
    }

    if (localPart.length <= 4) {
        // For short local parts, show first 2 characters and mask the rest
        return `${localPart.slice(0, 2)}${'*'.repeat(localPart.length - 2)}@${domain}`;
    }

    // For longer local parts, show first 4 characters and mask with 4 asterisks
    return `${localPart.slice(0, 4)}****@${domain}`;
}
