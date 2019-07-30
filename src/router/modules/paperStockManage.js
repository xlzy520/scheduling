export default {
  path: 'paperStockManage',
  meta: {
    title: '原纸库存管理',
  },
  children: [
    {
      path: 'paperInStock',
      meta: {
        title: '原纸入库',
      },
      //组件路径
      component: 'views/paperStockManage/paperInStock',
    },
    {
      path: 'paperOutStock',
      meta: {
        title: '原纸出库',
      },
      //组件路径
      component: 'views/paperStockManage/paperOutStock',
    }
  ],
};

