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
];
