export default {
  path: 'statement',
  meta: {
    title: '统计报表',
  },
  children: [
    {
      path: 'productionMinority',
      meta: {
        title: '生产少数',
      },
      //组件路径
      component: 'views/statement/productionMinority',
    },
    {
      path: 'orderStatistics',
      meta: {
        title: '订单统计',
      },
      //组件路径
      component: 'views/statement/orderStatistics',
    }
  ],
};

