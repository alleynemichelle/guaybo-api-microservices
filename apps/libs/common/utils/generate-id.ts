export function generateId(characters: number = 6): string {
    return Number(Date.now().toString().slice(-characters)) + Math.floor(Math.random() * 10000).toString();
}
