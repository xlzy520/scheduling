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
        component: 'views/paperKind/index',
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
        component: 'views/materialCode/index',
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
        component: 'views/paperSupplier/index',
      },
    ],
  },
];
