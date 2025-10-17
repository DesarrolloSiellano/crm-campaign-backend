export interface User {
  name: string;
  lastName: string;
  phone: string;
  email: string;
  username: string;
  password: string;
  created: Date;
  modified: Date;
  isActived: boolean;
  isAdmin: boolean;
  isNewUser: boolean;
  isSuperAdmin: boolean;
  company: string;
  passwordResetToken: string;
  passwordResetExpires: Date;
  modules: Module[];
  roles: Rol[];
  permissions: Permission[];
  createdDate: string;
  createdHour: string;
  updatedDate: string;
  updatedAtHour: string;
  idUserModified: string;
  idUserCreated: string;
}

export interface Module {
  name: string;
  description: string;
  created: Date;
  modified?: Date;
  dateCreated?: String;
  hourCreated?: String;
  dateModified?: String;
  hourModified?: String;
  idUserModified?: String;
  isActive: boolean;
  isSystemModule: boolean;
  router: Route[];
}

export interface Route {
  name: string;
  path: string;
  icon: string;
  children?: Route[]; // Opcional, arreglo de rutas hijas
}

export interface Permission  {
  name: string;
  description: string;
  action: string; // `create`, `read`, `update`, `delete`, etc.
  resource: string; // `usuarios`, `posts`, `comentarios`, etc.
  resourceId?: string; // Opcional, si aplica al recurso específico
  type: string; // `global` o `role-based`
  rol?: Rol; // Relación con el Rol
  created: Date;
  modified: Date;
  dateCreated?: String;
  hourCreated?: String;
  dateModified?: String;
  hourModified?: String;
  idUserModified?: String;
  isActive: boolean;
}


export interface Rol extends Document {
  name: string;
  codeRol: string;
  description: string;
  created: Date;
  modiefied: Date;
  isActive: boolean;
  dateCreated?: String;
  hourCreated?: String;
  dateModified?: String;
  hourModified?: String;
  idUserModified?: string;
  isInheritPermissions?: boolean;
  permissions: Permission[]
}