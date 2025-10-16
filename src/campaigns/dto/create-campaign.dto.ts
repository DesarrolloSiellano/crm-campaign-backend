export class CreateCampaignDto {
    company: string;
    name: string;
    description?: string;
    startDate: string;
    endDate: string;
    budget?: string;
    status: string;
    isActive: boolean;
    targetAudience?: string[];
    channels?: string[];
    createdAt?: string;
    updatedAt?: string;
    idUserCreated?: string;
    idUserUpdated?: string;
}
