import { Schema, model, Document } from 'mongoose';
import { Campaign } from 'src/campaigns/entities/campaign.entity';

export interface Event extends Document {
    title: string;
    description?: string;
    date: string; // YYYY-MM-DD
    startTime: string; // HH:mm
    endTime: string; // HH:mm
    location?: string;
    type: 'PRESENCIAL' | 'VIRTUAL';
    link?: string;
    assignedLeaderIds: string[]; // IDs of Multilevel nodes (Leaders or intermediate)
    company: string;
    campaign?: Campaign;
    status: 'PROGRAMADO' | 'COMPLETADO' | 'CANCELADO';
    createdDate: string;
    createdHour: string;
    idUserCreation: string;

}

export const EventSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    location: { type: String },
    type: { type: String, enum: ['PRESENCIAL', 'VIRTUAL'], default: 'PRESENCIAL' },
    link: { type: String },
    assignedLeaderIds: [{ type: Schema.Types.ObjectId, ref: 'Multilevel' }],
    company: { type: String, required: true },
    campaign: { type: Object, ref: 'Campaign' },
    status: { type: String, enum: ['PROGRAMADO', 'COMPLETADO', 'CANCELADO'], default: 'PROGRAMADO' },
    createdDate: { type: String, default: new Date().toISOString().split('T')[0] },
    createdHour: { type: String, default: new Date().toISOString().split('T')[1].split('.')[0] },
    idUserCreation: { type: String, required: true },
});

export const EventModel = model<Event>('Event', EventSchema);
