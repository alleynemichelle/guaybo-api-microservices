export enum MeetingPlatform {
    ZOOM = 'ZOOM',
    GOOGLE_MEETS = 'GOOGLE_MEETS',
    MICROSOFT_TEAMS = 'MICROSOFT_TEAMS',
    CUSTOM = 'CUSTOM',
    NONE = 'NONE',
}

export const formatPlatformName = (platform: MeetingPlatform | undefined): string => {
    if (!platform) return '';

    switch (platform) {
        case MeetingPlatform.ZOOM:
            return 'Zoom';
        case MeetingPlatform.GOOGLE_MEETS:
            return 'Google Meets';
        case MeetingPlatform.MICROSOFT_TEAMS:
            return 'Microsoft Teams';
        default:
            return platform;
    }
};
