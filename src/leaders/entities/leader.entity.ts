import moment from 'moment';
import { Schema, model, Document } from 'mongoose';
import { Campaign } from 'src/campaigns/entities/campaign.entity';
import {
  TenantBaseSchema,
  addTenantIndexes,
} from 'src/core/database/tenant.base.schema';
import { tenantPlugin } from 'src/core/database/tenant.plugin';

export interface Leader extends Document {
  tenantId: string;
  nombres: string;
  apellidos: string;
  tipoDocumento: string;
  numeroDocumento: string;
  celular: string;
  telefono?: string;
  nickname?: string;
  lat?: string;
  lng?: string;
  email?: string;
  fechaNacimiento: string;
  sexo: string;
  direccion: string;
  comuna: string;
  barrio: string;
  vereda?: string;
  corregimiento?: string;
  departamento: string;
  ciudad: string;
  tipoLider: string;
  urlFoto: string;
  originalNameFoto?: string;
  uuidFoto?: string;
  zonaInfluencia: string;
  numeroVotantes: string;
  fechaCreacion?: string;
  fechaModificacion?: string;
  horaModificacion?: string;
  horaCreacion?: string;
  idUserModificacion?: string;
  isUserModule?: boolean;
  idUser: string;
  company: string;
  campaign: Campaign;
}

export const LeaderSchema = new Schema({
  nombres: { type: String, required: true },
  apellidos: { type: String, required: true },
  tipoDocumento: { type: String, required: true },
  numeroDocumento: { type: String, required: true },
  celular: { type: String, required: true },
  telefono: { type: String },
  email: { type: String, required: true },
  fechaNacimiento: { type: String },
  sexo: { type: String },
  direccion: { type: String },
  nickname: { type: String },
  lat: { type: String },
  lng: { type: String },
  comuna: { type: String },
  barrio: { type: String },
  vereda: { type: String },
  corregimiento: { type: String },
  departamento: { type: String },
  ciudad: { type: String },
  tipoLider: { type: String },
  urlFoto: { type: String },
  originalNameFoto: { type: String },
  uuidFoto: { type: String },
  zonaInfluencia: { type: String },
  numeroVotantes: { type: String },
  campaign: { type: Object, ref: 'Campaign' },

  fechaCreacion: { type: String, default: moment().format('YYYY-MM-DD') },
  fechaModificacion: { type: String, default: moment().format('YYYY-MM-DD') },
  horaCreacion: { type: String, default: moment().format('HH:mm:ss') },
  horaModificacion: { type: String, default: moment().format('HH:mm:ss') },

  idUserCreacion: { type: Schema.Types.ObjectId, ref: 'User' },
  idUserModificacion: { type: Schema.Types.ObjectId, ref: 'User' },
  isUserModule: { type: Boolean, default: false },
  idUser: { type: Schema.Types.ObjectId, ref: 'User' },
  ...TenantBaseSchema,
});

// Registrar plugin de multi-tenant automático
LeaderSchema.plugin(tenantPlugin);

// Configuración de índices compuestos multi-tenant para rendimiento y aislamiento de unicidad
LeaderSchema.index({ company: 1, numeroDocumento: 1 }, { unique: true });
LeaderSchema.index({ company: 1, celular: 1 }, { unique: true });
LeaderSchema.index({ company: 1, email: 1 }, { unique: true });
addTenantIndexes(LeaderSchema, ['nombres', 'apellidos']);

export const LeaderModel = model<Leader>('Leader', LeaderSchema);
