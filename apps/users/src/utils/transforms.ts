export const transformFullName = (firstName: string, lastName: string): string => {
    return `${firstName} ${lastName || ''}`.trim();
};
