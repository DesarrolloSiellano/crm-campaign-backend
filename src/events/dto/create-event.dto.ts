export class CreateEventDto {
    title: string;
    description?: string;
    date: string;
    startTime: string;
    endTime: string;
    location?: string;
    type: 'PRESENCIAL' | 'VIRTUAL';
    link?: string;
    assignedLeaderIds: string[];
    capacity: number;
    company: string;
    campaign?: any;
    idUserCreation: string;
}
