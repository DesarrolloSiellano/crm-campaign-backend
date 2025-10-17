export const MODULES = [
  {
    _id: '68c217f3d4bca04c100485c0',
   
    name: 'crmCampaign',
    description: 'Este es el módulo para la creación de campañas',
    isActive: true,
    isSystemModule: false,
    routes: [
      {
        name: 'Opciones',
        path: '/pages',
        initPath: '',
        icon: '',
        isActive: true,
        children: [
          {
            name: 'DashBoard',
            path: '/dashboard',
            initPath: '',
            icon: 'home',
            isActive: true,
            _id: '68f015a63299e8bcd9d58f17',
  
          },
          {
            name: 'Multinivel',
            path: '/multilevel',
            icon: 'address-book',
            isActive: true,
            _id:  '68f015a63299e8bcd9d58f1a',

          },
        ],
        _id: '68f015a63299e8bcd9d58f18',
      },
    ],
  },
];
