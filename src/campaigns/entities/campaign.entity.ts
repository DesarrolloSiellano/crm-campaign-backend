import { Schema, Document } from 'mongoose';
import moment from 'moment';
import {
  TenantBaseSchema,
  addTenantIndexes,
} from 'src/core/database/tenant.base.schema';
import { tenantPlugin } from 'src/core/database/tenant.plugin';

export interface Campaign extends Document {
  tenantId: string;
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
  leaders: string[];
  createdAt?: string;
  updatedAt?: string;
  idUserCreated?: string;
  idUserUpdated?: string;
}

export const CampaignSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: false },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  budget: { type: String, required: false },
  status: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  targetAudience: { type: [String], required: false },
  channels: { type: [String], required: false },
  leaders: [{ type: Schema.Types.ObjectId, ref: 'Leader' }],
  createdAt: { type: String, default: moment().format('YYYY-MM-DD') },
  updatedAt: { type: String, default: moment().format('YYYY-MM-DD') },
  hourCreated: { type: String, default: moment().format('HH:mm:ss') },
  hourUpdated: { type: String, default: moment().format('HH:mm:ss') },
  idUserCreated: { type: Schema.Types.ObjectId, ref: 'User' },
  idUserUpdated: { type: Schema.Types.ObjectId, ref: 'User' },
  ...TenantBaseSchema,
});

// Registrar plugin de multi-tenant automático
CampaignSchema.plugin(tenantPlugin);

// Configuración de índices compuestos multi-tenant para rendimiento y aislamiento de unicidad
CampaignSchema.index({ company: 1, name: 1 }, { unique: true });
addTenantIndexes(CampaignSchema, ['status']);
