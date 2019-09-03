export default {
  path: 'prodManage',
  meta: {
    title: '生产管理',
  },
  children: [
    {
      path: 'orderManage',
      meta: {
        title: '订单管理',
      },
      //组件路径
      component: 'views/prodManage/orderManage',
    },
    {
      path: 'plannedMerger',
      meta: {
        title: '计划合并',
      },
      //组件路径
      component: 'views/prodManage/plannedMerger',
    },
    {
      path: 'planArrange',
      meta: {
        title: '计划排单',
      },
      //组件路径
      component: 'views/prodManage/planArrange',
    },
    {
      path: 'prodTask',
      meta: {
        title: '生产任务',
      },
      //组件路径
      component: 'views/prodManage/prodTask/index',
    },
    {
      path: 'branchTask',
      meta: {
        title: '分线任务',
      },
      //组件路径
      component: 'views/prodManage/branchTask',
    }
  ],
};

