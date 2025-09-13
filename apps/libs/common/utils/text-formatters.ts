export function cleanAlias(input: string): string {
    if (!input) return '';
    const removedAccents = input
        .toLocaleLowerCase()
        .replace(/á/g, 'a')
        .replace(/é/g, 'e')
        .replace(/í/g, 'i')
        .replace(/ó/g, 'o')
        .replace(/ú/g, 'u')
        .replace(/ñ/g, 'n')
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9-]/g, '')
        .replace(/-{2,}/g, '-')
        .trim()
        .replace(/^-+|-+$/g, '');

    return removedAccents;
}

/**
 * Extracts the path from a URL
 * @param value The URL to extract the path from
 * @returns The path
 */
export function extractPath(value?: string): string | undefined {
    if (!value) return undefined;
    // Regex: remove protocol and domain, keep the path
    const match = value.match(/^https?:\/\/[^/]+(\/.*)$/);
    let path = match ? match[1] : value;
    // Remove leading slash if present
    if (path.startsWith('/')) {
        path = path.substring(1);
    }
    return path;
}
