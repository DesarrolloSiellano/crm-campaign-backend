export const ROLES = [
  {
    _id: '68b89b7e2fdf0bc745c3a111',

    name: 'Usuario Básico',
    codeRol: 'USR',
    description: 'Acceso limitado a funciones principales del sistema',
    isActive: true,
    isInheritPermissions: true,
    permissions: [
      {
        name: 'Crear',
        description: '',
        action: 'true',
        isActive: true,
      },
      {
        name: 'Editar',
        description: '',
        action: 'true',
        isActive: true,
      },
      {
        name: 'Eliminar',
        description: '',
        action: 'true',
        isActive: true,
      },
      {
        name: 'Buscar',
        description: '',
        action: 'true',
        isActive: true,
      },
    ],
  },
];
