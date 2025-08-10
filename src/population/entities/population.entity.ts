import { Schema, model, Document } from 'mongoose';

export interface Population extends Document {
    direccion?: string;
    email?: string;
    fechaCreacion?: string;
    fechaModificacion?: string;
    fechaNacimiento: string;
    horaModificacion?: string;
    horaCreacion?: string;
    idUserModificacion?: string;
    idTipoDocumento?: string;
    numeroDocumento: string;
    primerApellido: string;
    primerNombre: string;
    segundoApellido?: string;
    segundoNombre?: string;
    sexo?: string;
    tel?: string;
    telefono?: string;
}

export const PopulationSchema = new Schema({
    direccion: { type: String },
    email: { type: String },
    fechaCreacion: { type: String, default: new Date().toISOString().split('T')[0] },
    fechaModificacion: { type: String, default:new Date().toISOString().split('T')[0]  },
    horaModificacion: { type: String, default: new Date().toISOString().split('T')[1].split('.')[0] },
    horaCreacion: { type: String, default: new Date().toISOString().split('T')[1].split('.')[0] },
    idUserModificacion: { type: Schema.Types.ObjectId, ref: 'User' },
    fechaNacimiento: { type: String, },
    idTipoDocumento: { type: String },
    numeroDocumento: { type: String, required: true, unique: true },
    primerApellido: { type: String, required: true },
    primerNombre: { type: String, required: true },
    segundoApellido: { type: String },
    segundoNombre: { type: String },
    sexo: { type: String },
    tel: { type: String },
    telefono: { type: String },
});

export const PersonaModel = model<Population>('Persona', PopulationSchema);

