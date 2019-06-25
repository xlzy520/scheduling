export default {
  path: 'example',
  redirect: 'example/manage',
  meta: {
    title: '系统设置',
  },
  children: [
    {
      path: 'manage',
      meta: {
        title: '角色管理'
      },
      //组件路径
      component: 'views/example/manage'
    },
    {
      path: 'user',
      meta: {
        title: '用户管理'
      },
      //组件路径
      component: 'views/example/user'
    }
  ]
};
