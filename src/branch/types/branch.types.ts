export type CreateBranchRecord = {
    name: string;
    code: string;
    organizationSlug: string;
    address: string;
    geoLocation: {
        latitude: number;
        longitude: number;
    };
    supports?: {
        dineIn: boolean;
        takeaway: boolean;
        delivery: boolean;
    };
    paymentProviders?: {
        cash: {
            enabled: boolean;
        };
        razorpay?: {
            enabled: boolean;
            keyId: string;
            keySecret: string;
        }
    };
    isActive?: boolean;
}