import { Schema, model, Document } from 'mongoose';
import { Campaign } from 'src/campaigns/entities/campaign.entity';
import {
  TenantBaseSchema,
  addTenantIndexes,
} from 'src/core/database/tenant.base.schema';
import { tenantPlugin } from 'src/core/database/tenant.plugin';

export interface Multilevel extends Document {
  tenantId: string;
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
  company: string;
  lat?: string; // coordenada geográfica
  lng?: string;
  campaign: Campaign;
}

export const MultilevelSchema = new Schema({
  idInvited: { type: Schema.Types.ObjectId, ref: 'Multilevel' },
  idParentLevel: { type: Schema.Types.ObjectId, ref: 'Multilevel' },
  idChild: { type: Schema.Types.ObjectId },
  levelShow: { type: String, require: true },
  level: { type: Number, require: true },
  profile: { type: String, require: true },
  conditions: { type: Boolean },
  policy: { type: Boolean },
  createdDate: {
    type: String,
    default: new Date().toISOString().split('T')[0],
  },
  createdHour: {
    type: String,
    default: new Date().toISOString().split('T')[1].split('.')[0],
  },
  updatedDate: {
    type: String,
    default: new Date().toISOString().split('T')[0],
  },
  updatedHour: {
    type: String,
    default: new Date().toISOString().split('T')[1].split('.')[0],
  },
  idUserUpdated: { type: Schema.Types.ObjectId, ref: 'user' },
  status: { type: String },
  actived: { type: Boolean },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  whatsapp: { type: String, required: true },
  email: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  country: { type: String },
  lat: { type: String }, // coordenada geográfica
  lng: { type: String },
  campaign: { type: Object, ref: 'Campaign' },
  ...TenantBaseSchema,
});

// Registrar plugin de multi-tenant automático
MultilevelSchema.plugin(tenantPlugin);

// Configuración de índices compuestos multi-tenant para rendimiento y aislamiento de unicidad
MultilevelSchema.index({ company: 1, whatsapp: 1 }, { unique: true });
MultilevelSchema.index({ company: 1, email: 1 }, { unique: true });
addTenantIndexes(MultilevelSchema, ['firstName', 'lastName', 'idParentLevel']);

export const MultilevelModel = model<Multilevel>(
  'Multilevel',
  MultilevelSchema,
);
