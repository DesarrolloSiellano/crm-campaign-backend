import { Schema, model, Document } from 'mongoose';

export interface Multilevel extends Document {
    idInvited: string;
    idParentLevel: string;
    idChild: string;
    levelShow: string;
    level: number;
    profile: string;
    conditions: boolean;
    policy: boolean;
    createdDate: string;
    createdHour: string;
    updatedDate: string;
    updatedHour: string;
    idUserUpdated: string;
    status: string;
    actived: boolean;
    firstName: string;
    lastName: string;
    whatsapp: string;
    email: string;
    address: string;
    city: string;
    state: string;
    country: string;
}

export const MultilevelSchema = new Schema({
    idInvited: { type: Schema.Types.ObjectId, ref: 'Multilevel', required: true },
    idParentLevel: { type: Schema.Types.ObjectId, ref: 'Multilevel', required: true },
    idChild: { type: Schema.Types.ObjectId },
    levelShow: { type: String, require: true},
    level: { type: Number, require: true},
    profile: { type: String, require: true},
    conditions: { type: Boolean},
    policy: { type: Boolean},
    createdDate: { type: String, default: new Date().toISOString().split('T')[0] },
    createdHour: { type: String, default: new Date().toISOString().split('T')[1].split('.')[0] },
    updatedDate: { type: String, default: new Date().toISOString().split('T')[0] },
    updatedHour: { type: String, default: new Date().toISOString().split('T')[1].split('.')[0] },
    idUserUpdated: { type: Schema.Types.ObjectId, ref: 'user' },
    status: { type: String },
    actived: { type: Boolean },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    whatsapp: { type: String, required: true, unique: true },
    email: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
})

export const MultilevelModel = model<Multilevel>('Multilevel', MultilevelSchema);
