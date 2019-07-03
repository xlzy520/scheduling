export default [
  {
    path: 'paperKind',
    redirect: 'paperKind/index',
    meta: {
      title: '原纸品种',
    },
    children: [
      {
        path: 'index',
        meta: {
          title: '原纸品种',
        },
        //组件路径
        component: 'views/baseSettings/paperKind/index',
      },
    ],
  },
  {
    path: 'materialCode',
    redirect: 'materialCode/index',
    meta: {
      title: '用料代码',
    },
    children: [
      {
        path: 'index',
        //组件路径
        component: 'views/baseSettings/materialCode/index',
      },
    ],
  },
  {
    path: 'paperSupplier',
    redirect: 'paperSupplier/index',
    meta: {
      title: '原纸供应商',
    },
    children: [
      {
        path: 'index',
        //组件路径
        component: 'views/baseSettings/paperSupplier/index',
      },
    ],
  },
  {
    path: 'productionLineTrimmingSettings',
    redirect: 'productionLineTrimmingSettings/index',
    meta: {
      title: '生产线修边设置',
    },
    children: [
      {
        path: 'index',
        //组件路径
        component: 'views/baseSettings/productionLineTrimmingSettings/index',
      },
    ],
  },
  {
    path: 'customerPackageQuantitySetting',
    redirect: 'customerPackageQuantitySetting/index',
    meta: {
      title: '客户打包数量设置',
    },
    children: [
      {
        path: 'index',
        //组件路径
        component: 'views/baseSettings/customerPackageQuantitySetting/index',
      },
    ],
  },
];
