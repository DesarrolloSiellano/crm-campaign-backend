import { Schema, Document } from 'mongoose';
import {
  TenantBaseSchema,
  addTenantIndexes,
} from 'src/core/database/tenant.base.schema';
import { tenantPlugin } from 'src/core/database/tenant.plugin';

export interface CampaignConfig extends Document {
  tenantId: string;
  company: string;
  campaign: string; // Campaign ID
}

export const CampaignConfigSchema = new Schema({
  campaign: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true },
  ...TenantBaseSchema,
});

// Registrar plugin de multi-tenant automático
CampaignConfigSchema.plugin(tenantPlugin);

// Configuración de índices compuestos multi-tenant
CampaignConfigSchema.index({ company: 1 }, { unique: true });
addTenantIndexes(CampaignConfigSchema, ['campaign']);
