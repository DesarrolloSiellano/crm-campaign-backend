export class CreateEventDto {
    title: string;
    description?: string;
    date: string;
    startTime: string;
    endTime: string;
    location?: string;
    type: 'PRESENCIAL' | 'VIRTUAL';
    link?: string;
    assignedLeaderIds: Object[];
    company: string;
    campaign?: any;
    idUserCreation: string;
}
