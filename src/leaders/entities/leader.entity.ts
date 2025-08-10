import { Schema, model, Document } from 'mongoose';

export interface Leader extends Document {
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
    ciudad: string;
    tipoLider: string;
    urlFoto: string;
    zonaInfluencia: string;
    numeroVotantes: string;
    fechaCreacion?: string;
    fechaModificacion?: string;
    horaModificacion?: string;
    horaCreacion?: string;
    idUserModificacion?: string;
    isUserModule?: boolean;
    idUser: string;
}

export const LeaderSchema = new Schema({
    nombres: { type: String, required: true },
    apellidos: { type: String, required: true },
    tipoDocumento: { type: String, required: true },
    numeroDocumento: { type: String, required: true, unique: true },
    celular: { type: String, required: true, unique: true },
    telefono: { type: String },
    email: { type: String, required: true, unique: true },
    fechaNacimiento: { type: String  },
    sexo: { type: String},
    direccion: { type: String},
    nickname: { type: String },
    lat: { type: String },
    lng: { type: String },
    comuna: { type: String },
    barrio: { type: String },
    vereda: { type: String },
    corregimiento: { type: String },
    ciudad: { type: String },
    tipoLider: { type: String },
    urlFoto: { type: String,  },
    zonaInfluencia: { type: String },
    numeroVotantes: { type: String },
    

    fechaCreacion: { type: String, default: new Date().toISOString().split('T')[0] },
    fechaModificacion: { type: String, default: new Date().toISOString().split('T')[0] },
    horaModificacion: { type: String, default: new Date().toISOString().split('T')[1].split('.')[0] },
    horaCreacion: { type: String, default: new Date().toISOString().split('T')[1].split('.')[0] },

    idUserCreacion: { type: Schema.Types.ObjectId, ref: 'User' },
    idUserModificacion: { type: Schema.Types.ObjectId, ref: 'User' },
    isUserModule: { type: Boolean, default: false },
    idUser: { type: Schema.Types.ObjectId, ref: 'User' }
});

export const LeaderModel = model<Leader>('Leader', LeaderSchema);
