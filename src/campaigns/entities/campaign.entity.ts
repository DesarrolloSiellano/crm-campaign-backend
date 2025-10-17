import { Schema, model, Document } from 'mongoose';
import moment from 'moment';



export interface Campaign extends Document {
    company: string;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    budget: string;
    status: string;
    isActive: boolean;
    targetAudience: string[];
    channels: string[];
    createdAt?: string;
    updatedAt?: string;
    idUserCreated?: string;
    idUserUpdated?: string;
}

export const CampaignSchema = new Schema({
    company: { type: String, required: true },
    name: { type: String, required: true, unique: true },
    description: { type: String, required: false },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    budget: { type: String, required: false },
    status: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    targetAudience: { type: [String], required: false },
    channels: { type: [String], required: false },
    createdAt: { type: String, default: moment().format('YYYY-MM-DD') },
    updatedAt: { type: String, default: moment().format('YYYY-MM-DD') },
    hourCreated: { type: String, default: moment().format('HH:mm:ss') },
    hourUpdated: { type: String, default: moment().format('HH:mm:ss') },
    idUserCreated: { type: Schema.Types.ObjectId, ref: 'User' },
    idUserUpdated: { type: Schema.Types.ObjectId, ref: 'User' }
});


