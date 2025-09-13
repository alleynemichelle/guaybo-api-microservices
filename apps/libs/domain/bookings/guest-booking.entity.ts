export interface GuestBooking {
    product: {
        recordId: string;
        name: string;
        alias?: string;
        hostId: string;
        timezone: string;
        mainGallery?: any[];
        productType: any;
        location?: any;
        description?: string;
    };
    booking: {
        recordId: string;
        date?: any;
        plan?: any;
    };
}
