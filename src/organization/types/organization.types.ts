export type CreateOrganizationInput = {
    name: string;
    address: string;
    slug: string;
    status: 'active' | 'pending' | 'suspended';
    timezone: 'Asia/Kolkata' | 'Asia/Dubai';
    currency: 'AED' | 'INR';
}